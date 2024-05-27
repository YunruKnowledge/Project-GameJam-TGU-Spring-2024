const rows = 40;
const cols = 40;
const light_radius = 8;
let entities = [];
const createEntity = () => {
  const entity = {
    position: {
      x: 5,
      y: 6,
    },
    name: "test",
  };
  return entity;
};
entities.push(createEntity());

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
        selectSurroundingBlocks(r, c, light_radius)
      );
      grid.appendChild(div);
    }
  }
};
initGameEvents();

const getRandomIntInclusive = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
};
setTimeout(() => {
  entity_move(entities[0]);

  setInterval(() => {}, 400);
}, 200);

// ENTITIES
const entity_move = async (entity, position_x, position_y) => {
  const path = await findPath(entity, {
    x: getRandomIntInclusive(0, 40),
    y: getRandomIntInclusive(0, 40),
  });
  console.log(path);

  let current_path_index = 0;
  const interval = setInterval(() => {
    // console.log(path[current_path_index]);
    
    if (current_path_index >= path.length) {
      clearPathingMove()
    }

    entity.position.x = path[current_path_index].y;
    entity.position.y = path[current_path_index].x;
    const tile = document.querySelector(
      `[id="${path[current_path_index].x}-${path[current_path_index].y}"]`
    );
    tile.classList.add("ent_test");

    // check for light, to re-path
    if (current_path_index > 5) {
      if (tile.hasAttribute("isLit")) {
        entity_move(entity)
        clearPathingMove()
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
    }


    console.log(tile);
    current_path_index++;
    function clearPathingMove() {
      clearTimeout(interval);
      return;
    }
  }, 200);
};

const selectSurroundingBlocks = (row, col, radius) => {
  // Clear
  document.querySelectorAll(".mapGrid div").forEach((el) => {
    el.removeAttribute("isLit");
    el.removeAttribute("light_value");
    el.style.backgroundColor = "";
  });

  for (let r = row - radius; r <= row + radius; r++) {
    for (let c = col - radius; c <= col + radius; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const distance = Math.sqrt((r - row) ** 2 + (c - col) ** 2);
        if (distance <= radius) {
          const intensity = 1 - distance / (radius + 1);
          const tile = document.getElementById(`${r}-${c}`);
          tile.style.backgroundColor = `rgba(255, 255, 255, ${intensity})`;
          tile.setAttribute("isLit", true);
          tile.setAttribute("light_value", intensity);
        }
      }
    }
  }
};

const findPath = (entity = null, position = { x: 0, y: 0 }) => {
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
    setTimeout(() => {
      resolve(resultWithWeight);
    }, 400);
  });
  // console.log(resultWithWeight);
};
