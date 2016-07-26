var app = angular.module('App', []);

app.controller('MainController', function($scope){

  $scope.visitedSquares = ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'];

  $scope.game = new Chess();

  // do not pick up pieces if the game is over
  // only pick up pieces for White
  $scope.onDragStart = function(source, piece, position, orientation) {
    if ($scope.game.in_checkmate() === true || $scope.game.in_draw() === true ||
      piece.search(/^b/) !== -1) {
      return false;
    }
  };

  $scope.makeRandomMove = function() {

    var possibleMoves = $scope.game.moves();

    if ($scope.game.in_checkmate() || $scope.game.in_draw() || possibleMoves.length === 0)
    {
      alert("Checkmate");
      return;
    }

    var randomIndex = Math.floor(Math.random() * possibleMoves.length);
    $scope.game.move(possibleMoves[randomIndex]);
    $scope.board.position($scope.game.fen());

    $scope.updateVisitedSquares();
    $scope.applyFog();

  };

  $scope.onDrop = function(source, target) {
    // see if the move is legal
    var move = $scope.game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return 'snapback';

    // make random legal move for black
    window.setTimeout($scope.makeRandomMove, 250);
  };

  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  $scope.onSnapEnd = function() {
    $scope.board.position($scope.game.fen());

    $scope.applyFog();    
  };



  $scope.initializeBoard = function()
  {
    var cfg = {
      draggable: true,
      position: 'start',
      onDragStart: $scope.onDragStart,
      onDrop: $scope.onDrop,
      onSnapEnd: $scope.onSnapEnd
    };
    $scope.board = ChessBoard('board', cfg);
  };

  $scope.updateVisitedSquares = function()
  {
    function sanitizeMove(m)
    {
      if(m[m.length-1] === "+") // Remove trailing +
        m = m.substr(0, m.length-1);
      if(m[m.length-1] === "#") // Remove trailing #
        m = m.substr(0, m.length-1);

      if(m.indexOf("=") > 0)
        m = m.substr(0, m.indexOf("="));

      m = m.substr(m.length-2); 

      return m;
    }

    var possibleMoves = $scope.game.moves();
    for(var i=0; i<possibleMoves.length; ++i)
    {
      var move = possibleMoves[i];
      console.log(move);
      var sanitizedMove = sanitizeMove(move);
      if($scope.visitedSquares.indexOf(sanitizedMove) <= 0)
      {
        $scope.visitedSquares.push(sanitizedMove);
      }
    }

  }

  $scope.applyFog = function()
  {
    var FOG_CLASS = "fow-fog";
    var squares = $("[data-square]");

    for(var i=0; i<squares.length; ++i)
    {
      var square = $(squares[i]);
      var pos = square.attr("data-square");

      var isFog = $scope.visitedSquares.indexOf(pos) < 0;
      if(isFog)
        square.addClass(FOG_CLASS);
      else
        square.removeClass(FOG_CLASS);
    }
  }

  $scope.initializeBoard();
  $scope.updateVisitedSquares();
  $scope.applyFog();
});
