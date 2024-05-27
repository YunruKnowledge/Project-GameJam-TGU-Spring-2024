const rows = 40;
const cols = 40;
const light_radius = 8;
let entities = [];

// CREATE FUNCTIONS
const createEntity = ({
  name = "null",
  position_x = 0,
  position_y = 0,
  health = 100,
  speed = 100,
} = {}) => {
  const entity = {
    position: {
      x: position_x,
      y: position_y,
    },
    name: name,
    stat: {
      health: health,
      speed: speed,
    },
  };
  console.log(entity);
  return entity;
};

// GENERAL
const initGameEvents = () => {
  const container = document.querySelector(".game_display_container");
  const grid = document.createElement("div");
  const tileWidth = container.clientHeight / rows;
  if (tileWidth != container.clientWidth / cols) {
    console.error(
      `WARNING: TILE WIDTH AND HEIGHT MISSMATCH, ${tileWidth} x ${
        container.clientWidth / cols
      }`
    );
  }

  grid.classList.add("mapGrid");
  grid.style.display = `grid`;
  grid.style.gridTemplateRows = `repeat(${rows},${tileWidth}px)`;
  grid.style.gridTemplateColumns = `repeat(${cols},${tileWidth}px)`;
  container.appendChild(grid);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const div = document.createElement("div");
      div.id = `${r}-${c}`;
      div.addEventListener("mouseover", () =>
        setLight_Glow(r, c, light_radius)
      );
      grid.appendChild(div);
    }
  }
};

// SET- MODIFY
const setLight_Glow = (row, col, radius) => {
  // Clear
  document.querySelectorAll(".mapGrid div").forEach((el) => {
    el.removeAttribute("isLit");
    el.removeAttribute("light_value");
    el.style.outline = ``;
    // el.style.backgroundColor = "";
  });

  for (let r = row - radius; r <= row + radius; r++) {
    for (let c = col - radius; c <= col + radius; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const distance = Math.sqrt((r - row) ** 2 + (c - col) ** 2);
        if (distance <= radius) {
          const intensity = 1 - distance / (radius + 1);
          const tile = document.getElementById(`${r}-${c}`);
          tile.style.outline = `1px dashed rgba(255, 255, 255, ${intensity})`;
          // tile.style.backgroundColor = `rgba(255, 255, 255, ${intensity})`;
          tile.setAttribute("isLit", true);
          tile.setAttribute("light_value", intensity);
        }
      }
    }
  }
};

// ENTITY - ENTITIES
const entity_move = async (entity, position_x, position_y) => {
  const path = await entity_findPath(entity, {
    x: position_x,
    y: position_y,
  });
  console.log(path);

  let current_path_index = 0;
  const interval = setInterval(() => {
    // console.log(path[current_path_index]);

    if (current_path_index >= path.length) {
      entity_lookForNewSafeSpot(entity)
      clearPathingMove();
    }

    entity.position.x = path[current_path_index].y;
    entity.position.y = path[current_path_index].x;
    const tile = document.querySelector(
      `[id="${path[current_path_index].x}-${path[current_path_index].y}"]`
    );
    tile.classList.add("ent_test");

    // check for light, to re-path
    if (current_path_index > 5 && tile.hasAttribute("isLit")) {
      entity_lookForNewSafeSpot(entity)
      clearPathingMove();
    } else if (tile.hasAttribute("isLit")) {
      const damage = 20 * Number(tile.getAttribute("light_value"));
      entity.stat.health = entity.stat.health - damage;
      console.log(entity.stat.health);
      if (entity.stat.health <= 0) {
        clearPathingMove({ clearSelf: true, deleteSelf: true });
        console.warn(entity, "stopped, quite DELETED");
      }
    }

    // previous tile
    if (current_path_index) {
      const prev_tile = document.querySelector(
        `[id="${path[current_path_index - 1].x}-${
          path[current_path_index - 1].y
        }"]`
      );
      prev_tile.classList.remove("ent_test");
    } else {
      const prev_tile = document.querySelector(
        `[id="${path[current_path_index].parent.x}-${path[current_path_index].parent.y}"]`
      );
      prev_tile.classList.remove("ent_test");
    }

    // console.log(tile);
    current_path_index++;
    function clearPathingMove(
      settings = { clearSelf: false, deleteSelf: false }
    ) {
      // entity_move(entity);
      if (settings.clearSelf) {
        tile.classList.remove("ent_test");
      }
      if (settings.deleteSelf) {
        entities = entities.filter(function (obj) {
          return obj.name !== entity.name;
        });
        console.log(entities);
      }
      clearTimeout(interval);
      return;
    }
  }, 80);
};

const entity_findNewSafeSpot = async (returnPostitions) => {
  let safeSpots = [];
  for (let i = 0; i < rows; i++) {
    let row_array = [];
    for (let j = 0; j < cols; j++) {
      const tile = document.querySelector(`[id="${i}-${j}"]`);
      if (tile.hasAttribute("islit")) {
        const lightValue = Number(tile.getAttribute("light_value"));
        // console.log(lightValue);
        row_array.push(2 / (1 - lightValue));
      } else {
        row_array.push(1);
      }

      if (row_array[j] === 1) {
        safeSpots.push({ x: j, y: i });
      }
    }
  }

  if (returnPostitions) {
    if (safeSpots.length > 0) {
      // return safeSpots[randomIndex];
      return new Promise((resolve) => {
        const randomIndex = Math.floor(Math.random() * safeSpots.length);
        console.log(safeSpots, randomIndex);
        console.log(safeSpots[randomIndex]);
        resolve(safeSpots[randomIndex]);
      });
    } else {
      // return null;
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }
};

const entity_lookForNewSafeSpot = async (entity)=> {
  const result = await entity_findNewSafeSpot(true);
  entity_move(entity, result.x, result.y);
}

const entity_findPath = (entity = null, position = { x: 0, y: 0 }) => {
  let mapGraph = [];
  for (let i = 0; i < rows; i++) {
    let row_array = [];
    for (let j = 0; j < cols; j++) {
      const tile = document.querySelector(`[id="${i}-${j}"]`);
      if (tile.hasAttribute("islit")) {
        const lightValue = Number(tile.getAttribute("light_value"));
        // console.log(lightValue);
        row_array.push(2 / (1 - lightValue));
      } else {
        row_array.push(1);
      }
    }
    mapGraph.push(row_array);
  }
  // console.log(mapGraph);
  // console.log(entity.position, position);

  // y x input/output order.
  const graphWithWeight = new Graph(mapGraph);
  const startWithWeight =
    graphWithWeight.grid[entity.position.y][entity.position.x];
  const endWithWeight = graphWithWeight.grid[position.y][position.x];
  const resultWithWeight = astar.search(
    graphWithWeight,
    startWithWeight,
    endWithWeight
  );
  const [...listOfMarkedTiles] = document.querySelectorAll(".mapGrid .marked");
  listOfMarkedTiles.forEach((el) => el.classList.remove("marked"));
  for (let index = 0; index < resultWithWeight.length; index++) {
    if (index == 0) {
      // include starting tile
      const tile = document.querySelector(
        `[id="${resultWithWeight[index].parent.x}-${resultWithWeight[index].parent.y}"]`
      );
      tile.classList.add("marked");
    }
    const tile = document.querySelector(
      `[id="${resultWithWeight[index].x}-${resultWithWeight[index].y}"]`
    );
    tile.classList.add("marked");
  }
  return new Promise((resolve) => {
    resolve(resultWithWeight);
  });
  // console.log(resultWithWeight);
};

initGameEvents();

const getRandomIntInclusive = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
};
setTimeout(() => {
  entities.push(createEntity({ name: "test" }));
  entities.push(createEntity());
  entities.push(createEntity({ name: "amander baller", health: 20 }));
  entity_lookForNewSafeSpot(entities[0])
  setInterval(() => {}, 400);
}, 200);
