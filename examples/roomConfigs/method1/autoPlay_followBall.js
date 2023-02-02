var { Utils } = require("../../src/index");

const minCoordAlignDelta = 0.5, minKickDistance = 2;

function roomCallback(room){ // examples start from here.

  // is needed for ball follow logic to pause.
  // notice that this is being updated not only onPositionsReset
  var lastPositionsReset = 0;

  // move bot in random Y direction
  // to prevent stucking on hitting a ball on a same spot in a same manner.
  // it also fixes a bug when the bot doesn't move after positions resets
  var moveInRandomY = function(){
    room.setKeyState(
      Utils.keyState(0, [1, -1][Math.floor(Math.random() * 2)], false)
    );
  };

  room.onGameStart = function(){
    lastPositionsReset = Date.now();
    moveInRandomY();
  };

  room.onGameTick = () => {
    // do not apply ball follow logic for maybe 150ms.
    // is needed for moveInRandomY() to work
    if (Date.now() - lastPositionsReset < 150) return;

    // get the original data object of the current player
    var playerDisc = room.getPlayerDiscOriginal(room.currentPlayerId);

    // coordinates: playerDisc.a.x, playerDisc.a.y
    // speed: playerDisc.D.x, playerDisc.D.y
    // radius: playerDisc.Z

    if (!playerDisc) // check or else error occurs after changing a player's team to spectators, if the player is not actually in the game, or the game is stopped.
      return;

    // get the original data object of the ball
    var ball = room.getBallOriginal();

    // coordinates: ball.a.x, ball.a.y
    // speed: ball.D.x, ball.D.y
    // radius: ball.Z

    // calculate delta difference for both x and y axis.
    var deltaX = ball.a.x - playerDisc.a.x, deltaY = ball.a.y - playerDisc.a.y;

    // x direction:
    if (Math.abs(deltaX) < minCoordAlignDelta) // we can omit small delta.
      dirX = 0;
    else 
      dirX = Math.sign(deltaX); // direction is +1 or -1, depending on the delta difference

    // y direction
    if (Math.abs(deltaY) < minCoordAlignDelta) // we can omit small delta.
      dirY = 0;
    else
      dirY = Math.sign(deltaY); // direction is +1 or -1, depending on the delta difference

    // kick is true if the distance between ball and player is less than minKickDistance
    kick = (deltaX * deltaX + deltaY * deltaY < (playerDisc.Z + ball.Z + minKickDistance) * (playerDisc.Z + ball.Z + minKickDistance));

    // apply current keys
    room.setKeyState(Utils.keyState(dirX, dirY, kick));
  };

  room.onPlayerTeamChange = function(){
    if (id === room.currentPlayerId) {
      lastPositionsReset = Date.now();
      moveInRandomY();
    }
  };

  room.onPositionsReset = function(){
    lastPositionsReset = Date.now();
    moveInRandomY();
  };
};
