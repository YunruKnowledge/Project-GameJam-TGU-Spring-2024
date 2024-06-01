const rows = 40;
const cols = 40;
const light_radius = 6;
const light_damage = 20;
const entity_limit = 10;
const game_defeat_time = 1; //seconds //currently debugging

const SPRITE_WIDTH = 16;
const SPRITE_HEIGHT = 16;
const SPRITE_BORDER_WIDTH = 0;
const SPRITE_SPACING_WIDTH = 0;

// math things...

const getRandomIntInclusive = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
};

const getRandomBorderPosition = () => {
  const randomInt = getRandomIntInclusive(1, 4);
  let position = {};
  if (randomInt == 1) {
    // top
    position.x = getRandomIntInclusive(0, cols - 1);
    position.y = rows - rows;
  }
  if (randomInt == 2) {
    // right
    position.x = cols - 1;
    position.y = getRandomIntInclusive(0, rows - 1);
  }
  if (randomInt == 3) {
    // bottom
    position.x = getRandomIntInclusive(0, cols - 1);
    position.y = rows - 1;
  }
  if (randomInt == 4) {
    // left
    position.x = cols - cols;
    position.y = getRandomIntInclusive(0, rows - 1);
  }
  return position;
};

const getTIleOffsetPosition = (col, row) => {
  return {
    x: SPRITE_BORDER_WIDTH + col * (SPRITE_SPACING_WIDTH + SPRITE_WIDTH),
    y: SPRITE_BORDER_WIDTH + row * (SPRITE_SPACING_WIDTH + SPRITE_HEIGHT),
  };
};

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

// variables
let entities = [];
let score = {
  points: 0,
  kills: 0,
  kill_types: {},
};
let load_tracker = {
  gridMap: false,
  background: false,
};
let global_timers = {};

// CREATE FUNCTIONS
const createGame_GridTiles = () => {
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
  container.prepend(grid);

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

  load_tracker.gridMap = true;
};

const createEntity = ({
  name = "null",
  position_x = 0,
  position_y = 0,
  health = 100,
  speed = 100,
  points = 20,
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
    points: points,
    id: createUUID(),
  };
  // console.log(entity);
  return entity;
};

const createEntity_spawn_multiple = (amount, unit) => {
  // later - unit types
  for (let index = 0; index < amount; index++) {
    const position = getRandomBorderPosition();
    const entity = createEntity({
      name: `vampire_unit`,
      health: 200,
      position_x: position.x,
      position_y: position.y,
    });
    entities.push(entity);
    createCanvas_unit(entity);
    entity_lookForNewSafeSpot(entity);
  }
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

const createCanvas_unit = (entity) => {
  const container = document.querySelector(".game_display_container");
  const grid = document.querySelector(".mapGrid");
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_WIDTH;
  canvas.height = SPRITE_HEIGHT;
  canvas.style.position = `absolute`;

  canvas.addEventListener("onFire", () => {});

  const context = canvas.getContext("2d");
  const image = new Image();
  const frame = [`./assets/temp_unit.png`, `./assets/temp_unit_scream.png`];
  image.src = `${frame[0]}`;
  image.onload = () => {
    // const tile_sprite = getSpriteFromTileSet(0);
    const offset = getTIleOffsetPosition(0, 0);

    context.drawImage(
      image,
      offset.x,
      offset.y,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
      0,
      0,
      SPRITE_WIDTH,
      SPRITE_HEIGHT
    );
  };

  const tilePosition = {
    x: document.querySelector(
      `[id="${entity.position.x}-${entity.position.y}"]`
    ).offsetLeft,
    y: document.querySelector(
      `[id="${entity.position.x}-${entity.position.y}"]`
    ).offsetTop,
  };
  entity.canvas = canvas;
  entity.canvas_position = tilePosition;
  console.log(entity);
  container.insertBefore(canvas, grid);
};

const createCanvas_background = () => {
  const container = document.querySelector(".game_display_container");
  const canvas = document.createElement("canvas");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  canvas.style.position = `absolute`;
  canvas.style.zIndex = `-1`;
  const context = canvas.getContext("2d");

  const image = new Image();
  image.src = `./assets/mana_seed/sample.png`;

  // console.log(Object.entries(spriteTileSet)[0][1].position);
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
    load_tracker.background = true;
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

// SET- MODIFY
const setUI_loadingValue = (loaded, required) => {
  const element = document.querySelector(".start_loadingValue");
  element.children[0].innerText = `${loaded}`;
  element.children[1].innerText = `${required}`;
};

const setLight_Glow = (row, col, radius) => {
  // Clear
  document.querySelectorAll(".mapGrid div").forEach((el) => {
    el.removeAttribute("isLit");
    el.removeAttribute("light_value");
    el.style.outline = ``;
    el.style.backgroundColor = "";
  });

  for (let r = row - radius; r <= row + radius; r++) {
    for (let c = col - radius; c <= col + radius; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const distance = Math.sqrt((r - row) ** 2 + (c - col) ** 2);
        if (distance <= radius) {
          const intensity = 1 - (distance * 1.15) / (radius + 1);
          const tile = document.getElementById(`${r}-${c}`);
          // tile.style.outline = `1px dashed rgba(255, 255, 255, ${intensity})`;
          tile.style.backgroundColor = `rgba(0, 0, 5, ${
            0.98 - intensity * 1.2
          })`;
          tile.setAttribute("isLit", true);
          tile.setAttribute("light_value", intensity);
        }
      }
    }
  }
};

const setEntity_canvasPosition = (entity) => {
  const tile = document.querySelector(
    `[id="${entity.position.y}-${entity.position.x}"]`
  );
  const offset = {
    x: tile.offsetLeft,
    y: tile.offsetTop,
  };
  entity.canvas_position = offset;
  entity.canvas.style.top = `${offset.y}px`;
  entity.canvas.style.left = `${offset.x}px`;
};

const setEntity_state = (entity, state, value) => {
  if (!entity.state) entity.state = {};
  entity.state[state] = value;
  // console.log(entity.state);
};

const setEntity_canvasReDraw = (entity) => {
  const canvas = entity.canvas;
  const context = canvas.getContext("2d");
  const list = [
    `./assets/temp_unit.png`,
    `./assets/temp_unit_scream.png`,
    `./assets/Mini_Fires_2/1/fireSpritesheet.png`,
  ];
  const image = new Image();
  if (entity.state)
    if (entity.state.onFire) {
      const fire_sprite = new Image();
      const image = new Image();
      image.src = `${list[1]}`;
      fire_sprite.src = `${list[2]}`;

      fire_sprite.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        // const tile_sprite = getSpriteFromTileSet(0);
        const offset = getTIleOffsetPosition(0, 0);
        context.drawImage(
          fire_sprite,
          offset.x,
          offset.y,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          0,
          0,
          SPRITE_WIDTH,
          SPRITE_HEIGHT
        );

        context.drawImage(
          image,
          0,
          0,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          0,
          0,
          SPRITE_WIDTH,
          SPRITE_HEIGHT
        );
        if (!entity.state.fireRenderLoop) {
          setEntity_drawFireLoop(entity);
        }
      };

      return;
    }

  image.src = `${list[0]}`;
  image.onload = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    // const tile_sprite = getSpriteFromTileSet(0);
    const offset = getTIleOffsetPosition(0, 0);

    context.drawImage(
      image,
      offset.x,
      offset.y,
      SPRITE_WIDTH,
      SPRITE_HEIGHT,
      0,
      0,
      SPRITE_WIDTH,
      SPRITE_HEIGHT
    );
  };
};

const setEntity_drawFireLoop = (entity) => {
  entity.state.fireRenderDelay = 0;
  entity.state.fireRenderTick = 0;
  entity.state.fireRenderLoop = setInterval(() => {
    const list = [
      `./assets/temp_unit.png`,
      `./assets/temp_unit_scream.png`,
      `./assets/Mini_Fires_2/1/fireSpritesheet.png`,
    ];
    if (entity.state.fireRenderDelay > 10) {
      const canvas = entity.canvas;
      const context = canvas.getContext("2d");
      const fire_sprite = new Image();
      const image = new Image();
      image.src = `${list[1]}`;
      fire_sprite.src = `${list[2]}`;

      fire_sprite.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        // const tile_sprite = getSpriteFromTileSet(0);
        const offset = getTIleOffsetPosition(0, entity.state.fireRenderTick);
        context.drawImage(
          image,
          0,
          0,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          0,
          0,
          SPRITE_WIDTH,
          SPRITE_HEIGHT
        );

        context.drawImage(
          fire_sprite,
          offset.x,
          offset.y,
          SPRITE_WIDTH,
          SPRITE_HEIGHT,
          0,
          0,
          SPRITE_WIDTH,
          SPRITE_HEIGHT
        );
        entity.state.fireRenderTick = entity.state.fireRenderTick + 1;
        if (entity.state.fireRenderTick >= 30) {
          clearInterval(entity.state.fireRenderLoop);
          delete entity.state.fireRenderLoop;
          delete entity.state.fireRenderDelay;
          delete entity.state.fireRenderTick;
        }
      };
    }
    const canvas = entity.canvas;
    const context = canvas.getContext("2d");
    const image = new Image();
    image.src = `${list[1]}`;

    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        0,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT,
        0,
        0,
        SPRITE_WIDTH,
        SPRITE_HEIGHT
      );
    };
    entity.state.fireRenderDelay = entity.state.fireRenderDelay + 1;
  }, entity.stat.speed / 30);
};

const setScore_points_additive = (amount) => {
  score.points = score.points + amount;
  setScore_updateDisplay(score.points);
  console.log(score);
};

const setScore_kills = (entity_name) => {
  score.kills = score.kills + 1;
  if (score.kill_types[entity_name])
    score.kill_types[entity_name] = score.kill_types[entity_name] + 1;
  else score.kill_types[entity_name] = 1;
};

const setScore_updateDisplay = (score) => {
  if (document.querySelector(`[id="${"game_score_text"}"]`))
    document.querySelector(
      `[id="${"game_score_text"}"]`
    ).innerText = `${score}`;
  else console.error("NO SCORE ELEMENT FOUND, #game_score_text");
};

// ENTITY - ENTITIES // uhh somewhere x and y is switched, should've gone for rows and cols instead :P
const entity_move = async (entity, position_x, position_y) => {
  const path = await entity_findPath(entity, {
    x: position_x,
    y: position_y,
  });
  // console.log(path);

  let current_path_index = 0;
  const interval = setInterval(() => {
    // console.log(path[current_path_index]);

    // health double check
    if (entity.stat.health <= 0) {
      entity_death();
    }

    if (current_path_index >= path.length) {
      entity_lookForNewSafeSpot(entity);
      clearPathingMove();
    }

    entity.position.x = path[current_path_index].y;
    entity.position.y = path[current_path_index].x;
    const tile = document.querySelector(
      `[id="${path[current_path_index].x}-${path[current_path_index].y}"]`
    );
    // tile.classList.add("ent_test");
    // console.log(tile.offsetLeft, tile.offsetTop);
    setEntity_canvasPosition(entity);

    // check for light, to re-path
    if (current_path_index > 5 && tile.hasAttribute("isLit")) {
      entity_lookForNewSafeSpot(entity);
      clearPathingMove();
    } else if (tile.hasAttribute("isLit")) {
      setEntity_state(entity, "onFire", true);
      setEntity_canvasReDraw(entity);

      const damage = light_damage * Number(tile.getAttribute("light_value"));
      entity.stat.health = entity.stat.health - damage;
      // console.log(entity.stat.health);
      if (entity.stat.health <= 0) {
        entity_death();
      }
    } else {
      setEntity_state(entity, "onFire", false);
      setEntity_canvasReDraw(entity);
    }

    // // previous tile
    // if (current_path_index) {
    //   const prev_tile = document.querySelector(
    //     `[id="${path[current_path_index - 1].x}-${
    //       path[current_path_index - 1].y
    //     }"]`
    //   );
    //   prev_tile.classList.remove("ent_test");
    // } else {
    //   const prev_tile = document.querySelector(
    //     `[id="${path[current_path_index].parent.x}-${path[current_path_index].parent.y}"]`
    //   );
    //   prev_tile.classList.remove("ent_test");
    // }

    // console.log(tile);
    current_path_index++;
    function entity_death() {
      clearPathingMove({ deleteSelf: true });
      setScore_kills(entity.name);
      setScore_points_additive(entity.points);
      console.warn(entity, "stopped, quite DELETED");
    }

    function clearPathingMove(
      settings = { clearSelf: false, deleteSelf: false }
    ) {
      // entity_move(entity);
      // if (settings.clearSelf) {
      //   tile.classList.remove("ent_test");
      // }
      if (settings.deleteSelf) {
        entity.canvas.remove();
        entities = entities.filter(function (obj) {
          clearInterval(interval);
          return obj.id !== entity.id;
        });
        // console.log(entities);
      }
      clearInterval(interval);
      return;
    }
  }, entity.stat.speed);
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
        // console.log(safeSpots, randomIndex);
        // console.log(safeSpots[randomIndex]);
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
  // const [...listOfMarkedTiles] = document.querySelectorAll(".mapGrid .marked");
  // listOfMarkedTiles.forEach((el) => el.classList.remove("marked"));
  // for (let index = 0; index < resultWithWeight.length; index++) {
  //   if (index == 0) {
  //     // include starting tile
  //     const tile = document.querySelector(
  //       `[id="${resultWithWeight[index].parent.x}-${resultWithWeight[index].parent.y}"]`
  //     );
  //     tile.classList.add("marked");
  //   }
  //   const tile = document.querySelector(
  //     `[id="${resultWithWeight[index].x}-${resultWithWeight[index].y}"]`
  //   );
  //   tile.classList.add("marked");
  // }
  return new Promise((resolve) => {
    resolve(resultWithWeight);
  });
  // console.log(resultWithWeight);
};

// GENERAL
const initGameEvents = () => {
  //UI
  document.querySelector(".end_UI").classList.add("hidden");
  document.querySelector(".start_menu").classList.add("hidden");
  document.querySelector(".start_UI").classList.remove("hidden");
  document.querySelector(".start_loadingScreen").classList.remove("hidden");
  reset_UI_values();

  //game
  reset_gameValues();
  createGame_GridTiles();
  createCanvas_background();

  const loader = setInterval(() => {
    let loaded_total = 0;
    let load_length = 0;
    for (const key in load_tracker) {
      if (Object.hasOwnProperty.call(load_tracker, key)) {
        load_length++;
        if (load_tracker[key]) loaded_total++;
      }
    }
    console.log(load_tracker, loaded_total, load_length);
    setUI_loadingValue(loaded_total, load_length);
    if (loaded_total == load_length) {
      createEntity_spawn_init();
      clearInterval(loader);
      document.querySelector(".start_UI").classList.add("hidden");
      document.querySelector(".end_UI").classList.add("hidden");
      document.querySelector(".start_loadingScreen").classList.add("hidden");
      document.querySelector(".game_UI").classList.remove("hidden");
    }
  }, 400);

  const createEntity_spawn_init = () => {
    const spawnInterval = setInterval(() => {
      if (entities.length < entity_limit) {
        createEntity_spawn_multiple(1);

        if (global_timers.entityLimitExceed) {
          clearInterval(global_timers.entityLimitExceed);
          delete global_timers.entityLimitExceed;
        }
      } else {
        if (!global_timers.entityLimitExceed) {
          global_timers.entityLimitExceed = setTimeout(() => {
            clearInterval(spawnInterval);
            clearInterval(global_timers.entityLimitExceed);
            delete global_timers.entityLimitExceed;

            const final_score = score;
            const UI_stats_container = document.querySelector(".end_stats");
            for (const key in final_score) {
              if (Object.hasOwnProperty.call(final_score, key)) {
                const text = document.createElement("p");
                if (key === `kill_types`) {
                  //need loop later?
                  // console.log(
                  //   final_score[key],
                  //   Object.entries(final_score[key])[0][1]
                  // );
                  if (Object.keys(final_score[key])[0])
                    text.innerText = `${Object.keys(final_score[key])[0]}: ${
                      Object.entries(final_score[key])[0][1]
                    }`;
                  UI_stats_container.appendChild(text);
                } else {
                  if (key === `kills` && final_score[key] > 50) {
                    const victory_message =
                      document.querySelector(".victory_message");
                    victory_message.innerText = `But you did a valorant effort!`;
                  } else if (key === `kills` && final_score[key] > 40) {
                    const victory_message =
                      document.querySelector(".victory_message");
                    victory_message.innerText = `But you almost managed to eradicated them!`;
                  } else if (key === `kills` && final_score[key] > 30) {
                    const victory_message =
                      document.querySelector(".victory_message");
                    victory_message.innerText = `But atleast it were for democracy!`;
                  } else if (key === `kills` && final_score[key] > 20) {
                    const victory_message =
                      document.querySelector(".victory_message");
                    victory_message.innerText = `But atleast you did your part.`;
                  } else if (key === `kills` && final_score[key] > 10) {
                    const victory_message =
                      document.querySelector(".victory_message");
                    victory_message.innerText = `But still very well done job!`;
                  } else if (key === `kills` && final_score[key] <= 10) {
                    const victory_message =
                      document.querySelector(".victory_message");
                    victory_message.innerText = `Better luck next time...`;
                  }

                  text.innerText = `${key}: ${final_score[key]}`;
                  UI_stats_container.appendChild(text);
                }
              }
            }

            for (let index = 0; index < entities.length; index++) {
              // console.log(entities[index]);
              entities[index].stat.health = -1;
            }

            setUI_loadingValue(0, Object.entries(load_tracker).length);

            const [...all_canvas] = document.querySelectorAll("canvas");
            // console.log(all_canvas);
            all_canvas.forEach((el) => {
              el.remove();
            });
            // console.log(document.querySelector(".mapGrid"));
            document.querySelector(".game_UI").classList.add("hidden");
            document.querySelector(".mapGrid").remove();
            document.querySelector(".end_UI").classList.remove("hidden");
          }, game_defeat_time * 1000);
        }
      }
    }, 400);
  };
};

const reset_gameValues = () => {
  setScore_points_additive(score.points * -1);
  score.kills = score.kills - score.kills;
  score.kill_types = {};

  for (const key in load_tracker) {
    if (Object.hasOwnProperty.call(load_tracker, key)) {
      load_tracker[key] = false;
    }
  }
};

const reset_UI_values = () => {
  const UI_stats_container = document.querySelector(".end_stats");
  console.log(UI_stats_container);
  const [...UI_stats_elements] = UI_stats_container.children;
  console.log(UI_stats_elements);
  UI_stats_elements.forEach((element, index) => {
    console.log(element, index);
    if (index) element.remove();
  });
};
