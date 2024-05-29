const rows = 40;
const cols = 40;
const light_radius = 8;

const SPRITE_WIDTH = 16;
const SPRITE_HEIGHT = 16;
const SPRITE_BORDER_WIDTH = 0;
const SPRITE_SPACING_WIDTH = 0;

const getRandomIntInclusive = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
};

const getTIleOffsetPosition = (col, row)=> {
  return {
    x: SPRITE_BORDER_WIDTH + col * (SPRITE_SPACING_WIDTH + SPRITE_WIDTH),
    y: SPRITE_BORDER_WIDTH + row * (SPRITE_SPACING_WIDTH + SPRITE_HEIGHT),
  };
}

const spriteTileSet = {
  grass1: {
    position: getTIleOffsetPosition(0, 1),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass2: {
    position: getTIleOffsetPosition(0, 2),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass3: {
    position: getTIleOffsetPosition(0, 3),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass4: {
    position: getTIleOffsetPosition(0, 4),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass5: {
    position: getTIleOffsetPosition(0, 5),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass6: {
    position: getTIleOffsetPosition(0, 6),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass7: {
    position: getTIleOffsetPosition(1, 6),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass8: {
    position: getTIleOffsetPosition(2, 6),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass9: {
    position: getTIleOffsetPosition(3, 6),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass10: {
    position: getTIleOffsetPosition(0, 7),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass11: {
    position: getTIleOffsetPosition(1, 7),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass12: {
    position: getTIleOffsetPosition(2, 7),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  grass13: {
    position: getTIleOffsetPosition(3, 7),
    isBlockade: false,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  rock1: {
    position: getTIleOffsetPosition(4, 6),
    isBlockade: true,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  rock2: {
    position: getTIleOffsetPosition(4, 7),
    isBlockade: true,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  rock3: {
    position: getTIleOffsetPosition(4, 8),
    isBlockade: true,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  rock4: {
    position: getTIleOffsetPosition(4, 9),
    isBlockade: true,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  flower1: {
    position: getTIleOffsetPosition(0, 8),
    isBlockade: true,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  flower2: {
    position: getTIleOffsetPosition(0, 9),
    isBlockade: true,
    width: 16,
    height: 16,
    isTransparent: false,
  },
  flower3: {
    position: getTIleOffsetPosition(1, 8),
    isBlockade: true,
    width: 16,
    height: 32,
    isTransparent: true,
  },
  flower4: {
    position: getTIleOffsetPosition(2, 8),
    isBlockade: true,
    width: 32,
    height: 32,
    isTransparent: true,
  },
};

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
    id: createUUID(),
  };
  console.log(entity);
  return entity;
};

const createUUID = () => {
  var d = new Date().getTime(); //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const createCanvas_background = () => {
  const container = document.querySelector(".game_display_container");
  const canvas = document.createElement("canvas");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  canvas.style.position = `absolute`;
  const context = canvas.getContext("2d");

  const image = new Image();
  image.src = `./assets/mana_seed/sample.png`;

  console.log(Object.entries(spriteTileSet)[0][1].position);
  image.onload = function () {
    //draw faceplate
    let transparent_sprites = [];
    let occupied_tiles = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const weight1 = 1 / 6; // 5 used
        const weight2 = weight1 / 9; // 8 used
        const weight3 = weight2 / 8; // 8
        // console.log(weight1,weight2);
        const tileNumber = weightedRand({
          0: weight1,
          1: weight1,
          2: weight1,
          3: weight1,
          4: weight1,
          5: weight2,
          6: weight2,
          7: weight2,
          8: weight2,
          9: weight2,
          10: weight2,
          11: weight2,
          12: weight2,
          13: weight3,
          14: weight3,
          15: weight3,
          16: weight3,
          17: weight3,
          18: weight3,
          19: weight3,
          20: weight3,
        });

        let tile_sprite = getSpriteFromTileSet(tileNumber);

        // overlapping check
        if (tile_sprite.width > 16 || tile_sprite.height > 16) {
          const how_many_cols_taken =
            tile_sprite.height / getSpriteFromTileSet(0).height;
          const how_many_rows_taken =
            tile_sprite.width / getSpriteFromTileSet(0).width;

          const scanForOverlap = () => {
            for (let r_taken = 0; r_taken < how_many_rows_taken; r_taken++) {
              for (let c_taken = 0; c_taken < how_many_cols_taken; c_taken++) {
                let isNotOverlapping = true;
                for (let index = 0; index < occupied_tiles.length; index++) {
                  if (
                    occupied_tiles[index].r == r + r_taken &&
                    occupied_tiles[index].c == c + c_taken
                  ) {
                    isNotOverlapping = false;
                    // console.log(isNotOverlapping,document.querySelector(`[id="${c + c_taken}-${r + r_taken}"]`));
                  }
                }
                // console.log(isNotOverlapping);
                if (!isNotOverlapping) {
                  tile_sprite = getSpriteFromTileSet(1);
                  return;
                }

                if (
                  document.querySelector(`[id="${c + c_taken}-${r + r_taken}"]`)
                ) {
                  if (tile_sprite.isBlockade)
                    document
                      .querySelector(`[id="${c + c_taken}-${r + r_taken}"]`)
                      .setAttribute("isBlockade", true);
                  occupied_tiles.push({ r: r + r_taken, c: c + c_taken });
                }

                // debug
                // if (
                //   document.querySelector(
                //     `[id="${c + c_taken}-${r + r_taken}"]`
                //   ) &&
                //   isNotOverlapping
                // )
                //   document
                //     .querySelector(`[id="${c + c_taken}-${r + r_taken}"]`)
                //     .classList.add("marked");
              }
            }
          };
          scanForOverlap();
          // console.log(occupied_tiles);
        }

        if (tile_sprite.isTransparent) {
          const gridPosition = {
            r: r,
            c: c,
          };
          transparent_sprites.push({ tile_sprite, gridPosition });

          const temp_tileNumber = getRandomIntInclusive(0, 4);
          const temp_tile_sprite = getSpriteFromTileSet(temp_tileNumber);
          context.drawImage(
            image,
            temp_tile_sprite.position.x,
            temp_tile_sprite.position.y,
            temp_tile_sprite.width,
            temp_tile_sprite.height,
            SPRITE_WIDTH * r,
            SPRITE_WIDTH * c,
            temp_tile_sprite.width,
            temp_tile_sprite.height
          );
        } else {
          for (let index = 0; index < occupied_tiles.length; index++) {
            if (occupied_tiles[index].r == r && occupied_tiles[index].c == c) {
            }
          }

          if (tile_sprite.isBlockade) {
            document
              .querySelector(`[id="${c}-${r}"]`)
              .setAttribute("isBlockade", true);
          }

          context.drawImage(
            image,
            tile_sprite.position.x,
            tile_sprite.position.y,
            tile_sprite.width,
            tile_sprite.height,
            SPRITE_WIDTH * r,
            SPRITE_WIDTH * c,
            tile_sprite.width,
            tile_sprite.height
          );
        }
      }
    }

    // reprint any transparent sprites.
    if (transparent_sprites.length > 0) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          for (let index = 0; index < transparent_sprites.length; index++) {
            if (
              transparent_sprites[index].gridPosition.r == r &&
              transparent_sprites[index].gridPosition.c == c
            ) {
              context.drawImage(
                image,
                transparent_sprites[index].tile_sprite.position.x,
                transparent_sprites[index].tile_sprite.position.y,
                transparent_sprites[index].tile_sprite.width,
                transparent_sprites[index].tile_sprite.height,
                SPRITE_WIDTH * r,
                SPRITE_WIDTH * c,
                transparent_sprites[index].tile_sprite.width,
                transparent_sprites[index].tile_sprite.height
              );
            }
          }
        }
      }
    }
    container.prepend(canvas);
  };

  // add check for number and string later, if string then search for Obj.entries name
  const getSpriteFromTileSet = (indexID, width = 16, height = 16) => {
    return Object.entries(spriteTileSet)[indexID][1];
  };

  const weightedRand = (spec) => {
    var i,
      sum = 0,
      r = Math.random();
    for (i in spec) {
      sum += spec[i];
      if (r <= sum) return i;
    }
  };
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
  createCanvas_background();
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
      entity_lookForNewSafeSpot(entity);
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
      entity_lookForNewSafeSpot(entity);
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
          return obj.id !== entity.id;
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

const entity_lookForNewSafeSpot = async (entity) => {
  const result = await entity_findNewSafeSpot(true);
  entity_move(entity, result.x, result.y);
};

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
      } else if (tile.hasAttribute("isBlockade")) {
        row_array.push(0);
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


setTimeout(() => {
  for (let index = 0; index < 5; index++) {
    entities.push(createEntity({ name: "amander baller", health: 200 }));
    entity_lookForNewSafeSpot(entities[index]);
  }
  // entity_lookForNewSafeSpot(entities[1]);
  // entity_lookForNewSafeSpot(entities[2]);
  setInterval(() => {}, 400);
}, 200);
