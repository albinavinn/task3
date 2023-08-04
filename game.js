
// node game.js rock paper scissors lizard Spock

const crypto = require('crypto');

class KeyGenerator {
  static generateKey(length) {
    return crypto.randomBytes(length / 8).toString('hex');
  }
}

class HMACGenerator {
  static generateHMAC(key, data) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(data);
    return hmac.digest('hex');
  }
}

class Rules {
  constructor(moves) {
    this.moves = moves;
    this.size = moves.length;
    this.table = this.generateTable();
  }

  generateTable() {
    const table = Array.from({ length: this.size }, () => Array(this.size).fill('Draw'));

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (i === j) {
          table[i][j] = 'Draw';
        } else if ((i + 1) % this.size === j || (i + 3) % this.size === j) {
          table[i][j] = 'Win';
        } else {
          table[i][j] = 'Lose';
        }
      }
    }

    return table;
  }

  getMoveName(moveIndex) {
    return this.moves[moveIndex - 1];
  }

  getOutcome(playerMoveIndex, computerMoveIndex) {
    return this.table[playerMoveIndex - 1][computerMoveIndex - 1];
  }
}

class Game {
  constructor(moves) {
    this.moves = moves;
    this.rules = new Rules(moves);
    this.playerWins = 0; 
    this.computerWins = 0; 
  }

  displayMenu() {
    console.log('Available moves:');
    this.moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
    console.log('0 - exit');
    console.log('? - help');
  }

  getUserInput() {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      readline.question('Enter your move: ', (input) => {
        readline.close();
        resolve(input);
      });
    });
  }

  validateUserInput(input) {
    if (input === '?' || input === '0') return true;
    const moveIndex = parseInt(input);
    return !isNaN(moveIndex) && moveIndex >= 1 && moveIndex <= this.moves.length;
  }

  async play() {
    while (true) {
      this.key = KeyGenerator.generateKey(256); // Generate a new key for each game

      console.log('HMAC:', HMACGenerator.generateHMAC(this.key, this.moves[Math.floor(Math.random() * this.moves.length)]));

      this.displayMenu();

      let userInput;
      do {
        userInput = await this.getUserInput();
        if (!this.validateUserInput(userInput)) {
          console.log('This is wrong 😟. You need to enter a number from 1-5 to move, 0 - to exit, ? - to help');
        }
      } while (!this.validateUserInput(userInput));

      if (userInput === '0') {
        console.log('Goodbye!');
        this.printFinalResult();
        process.exit(0);
      }

      if (userInput === '?') {
        this.displayHelp();
      } else {
        const playerMoveIndex = parseInt(userInput);
        const playerMoveName = this.rules.getMoveName(playerMoveIndex);

        console.log('Your move:', playerMoveName);
        const computerMoveIndex = Math.floor(Math.random() * this.moves.length) + 1;
        console.log('Computer move:', this.moves[computerMoveIndex - 1]);

        const outcome = this.rules.getOutcome(playerMoveIndex, computerMoveIndex);
        if (outcome === 'Win') {
          console.log('You win!');
          this.playerWins++; 
        } else if (outcome === 'Lose') {
          console.log('You lose!');
          this.computerWins++; 
        } else {
          console.log("It's a draw!");
        }

        console.log('HMAC key:', this.key);
      }

      console.log('Result:');
      console.log('Player wins:', this.playerWins);
      console.log('Computer wins:', this.computerWins);
      console.log();
    }
  }

  displayHelp() {
    const headerRow = ['Moves', ...this.moves];
    const table = [headerRow];

    for (let i = 0; i < this.moves.length; i++) {
      const row = [this.moves[i]];
      for (let j = 0; j < this.moves.length; j++) {
        const outcome = this.rules.getOutcome(i + 1, j + 1); 
        row.push(outcome);
      }
      table.push(row);
    }

    const maxLength = Math.max(...headerRow.map((cell) => cell.length));
    const formatCell = (cell) => cell.padEnd(maxLength + 2);
    const formattedTable = table.map((row) => row.map(formatCell));
    const helpText = formattedTable.map((row) => row.join('')).join('\n');
    console.log(helpText);
  }

  printFinalResult() {
    console.log('Final Result:');
    console.log('Player wins:', this.playerWins);
    console.log('Computer wins:', this.computerWins);
  }
}

const moves = process.argv.slice(2);
if (moves.length < 3 || moves.length % 2 !== 1 || new Set(moves).size !== moves.length) {
  console.error('Invalid arguments');
  process.exit(1);
}

const game = new Game(moves);
game.play();
