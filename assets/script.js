'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  //We make a copy of the arr using splice and use the copy to sort the arr to avoid mutating the og. If the sort parameter of the function is true it will sort it, if its false it will simply equal to movements (un-sorted)
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? `deposit` : `withdrawal`;
    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__value">${mov}€</div>
    </div>`;
    containerMovements.insertAdjacentHTML(`afterbegin`, html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}€`;
};

//Here we will chain different methods together so we can disply the total income of the account, the outcome of the account, and the total interest earned
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

//Here we create a new property for each account object, we create the username property which takes the name in the owner property and returns the initials in lower case for the username property
const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsername(accounts);
console.log(accounts);

const updateUi = acc => {
  //Display movements
  displayMovements(acc.movements);
  //Display balance
  calcDisplayBalance(acc);
  //Display summary
  calcDisplaySummary(acc);
};
//Event handler
let currentAccount;
btnLogin.addEventListener(`click`, function (e) {
  //Prevents form from submitting
  e.preventDefault();
  //Here is the login logic, where the acc has to be found if it exists and if it does the pin must match
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    console.log(`LOGIN`);
    //Display UI and message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(` `)[0]
    }`;
    containerApp.style.opacity = 100;
    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    //Unselects the pin box
    inputLoginPin.blur();

    //Update UI
    updateUi(currentAccount);
  }
});

//Adding Transfers

btnTransfer.addEventListener(`click`, function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Update UI
    updateUi(currentAccount);
  }
});

// Load Feature
btnLoan.addEventListener(`click`, function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //Add movement
    currentAccount.movements.push(amount);

    //Update UI
    updateUi(currentAccount);
  }
  inputLoanAmount.value = ``;
});

// The findIndex Method
// Deleting an account
btnClose.addEventListener(`click`, function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    //Delete acc
    accounts.slice(index, 1);

    //Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = ``;
});

let sorted = false;
btnSort.addEventListener(`click`, function (e) {
  e.preventDefault();
  // we set the sort parameter to true/false whenever the sort btn is clicked
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

const eurToUsd = 1.1;
const movementsUsd = movements.map(
  mov => mov * eurToUsd
  // function (mov) {
  // return mov * eurToUsd;
  // }
);
console.log(movements);
console.log(movementsUsd);

const movementsUsdFor = [];
for (const mov of movements) {
  movementsUsdFor.push(mov * eurToUsd);
}
console.log(movementsUsdFor); //Same as the map method above

const movementsDescriptions = movements.map(
  (mov, i) =>
    `Movement ${i + 1}: You ${mov > 0 ? `deposited` : `withdrew`} ${Math.abs(
      mov
    )}`
);
console.log(movementsDescriptions); //gives back an array with the string descriptions

//Here we want to filter the movments arr and get only the deposits (positive movements)
const deposits = movements.filter(function (mov) {
  return mov > 0;
});
console.log(deposits);

const depositsFor = [];
for (const mov of movements)
  if (mov > 0) {
    depositsFor.push(mov);
  }
console.log(depositsFor);

//Here we want to do the same but only for withdrawals and with an arrow function
const withdrawals = movements.filter(mov => mov < 0);
console.log(withdrawals);

// //The first parameter is the accumulator, which keeps accumulating the values (LIKE A SNOW BALL), cur is the current element of the array, i is the index, and arr is the entire array. This method also has a SECOND parameter, which is the initial value of the accumulator which in this case is 0, since we want to start adding from 0
// const balance = movements.reduce(function (acc, cur, i, arr) {
//   console.log(`Iteration number ${i}: ${acc}`);
//   return acc + cur;
// }, 0);
// //Arrow funtion
// console.log(balance);
// const balance1 = movements.reduce((acc, cur, i) => acc + cur, 0);
// console.log(balance1);

// let balance2 = 0;
// for (const mov of movements) {
//   balance2 += mov;
// }
// console.log(balance2);

//Maximum value of the movements array
const max = movements.reduce((acc, mov) => {
  if (acc > mov) {
    return acc;
  } else {
    return mov;
  }
}, movements[0]);
console.log(max);

// //Coding Challenge 2
const dogAges = [5, 2, 4, 1, 15, 8, 3];
// //Function method
const calcAverageHumanAge = function (ages) {
  const humanAges = ages.map(function (dogAge) {
    if (dogAge <= 2) {
      return 2 * dogAge;
    } else {
      return 16 + dogAge * 4;
    }
  });
  console.log(humanAges);
  const adults = humanAges.filter(function (humanAge) {
    return humanAge >= 18;
  });
  console.log(adults);
  const averageAge =
    adults.reduce(function (acc, cur) {
      return acc + cur;
    }, 0) / adults.length;
  // OR acc + cur /arr.length,0
  console.log(averageAge);
};
calcAverageHumanAge(dogAges);

// //Arrow function method
// const calcAverageHumanAge2 = function (ages) {
//   const humanAges2 = ages.map(dogAge =>
//     dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4
//   );
//   console.log(humanAges2);
//   const adults2 = humanAges2.filter(humanAge => humanAge >= 18);
//   console.log(adults2);
//   const averageAge2 =
//     adults2.reduce((acc, cur) => acc + cur, 0) / adults2.length;
//   console.log(averageAge2);
// };
// calcAverageHumanAge2(dogAges);
////////////////////////////////////////////////////
const totalDepositsUSD = movements
  .filter(mov => mov > 0)
  .map(mov => mov * eurToUsd)
  .reduce((acc, mov) => acc + mov, 0);
console.log(totalDepositsUSD);

////////////////////////////////////////////////////
//Coding Challenge 3
//Arrow function method + Chaining
const calcAverageHumanAge2 = ages =>
  ages
    .map(dogAge => (dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4))
    .filter(humanAge => humanAge >= 18)
    .reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
console.log(calcAverageHumanAge2(dogAges));

//Here we want to find the first withdrawal
const firstWithdrawal = movements.find(mov => mov < 0);
console.log(firstWithdrawal);

console.log(accounts);
const account = accounts.find(acc => acc.owner === `Jessica Davis`);
console.log(account);

//////
// some and every Methods
// some
console.log(movements); //[200, 450, -400, 3000, -650, -130, 70, 1300]
console.log(movements.includes(-130)); // true

const anyDeposits = movements.some(mov => mov > 0);
console.log();
anyDeposits; // true

// every
console.log(movements.every(mov => mov > 0)); // false
console.log(account4.movements.every(mov => mov > 0)); //true since it only has deposits

// Separate callback
const deposit = mov => mov > 0;
console.log(movements.some(deposit));
console.log(movements.every(deposit));
console.log(movements.filter(deposit));

// Flat and FlatMap Methods

const arr = [[1, 2, 3], [4, 5, 6], 7, 8]; // What if we wanna out all the numbers into just one arr?
console.log(arr.flat()); //[1, 2, 3, 4, 5, 6, 7, 8]

const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
console.log(arrDeep.flat()); //[[1, 2], 3, 4, [5, 6], 7, 8] only flattens it 1 level deep
console.log(arrDeep.flat(2)); //[1, 2, 3, 4, 5, 6, 7, 8] goes 2 levels deep (default is 1)

const accountMovements = accounts.map(acc => acc.movements);
console.log(accountMovements); //[Array(8), Array(8), Array(8), Array(5)]
const allMovements = accountMovements.flat();
console.log(allMovements); //[200, 450, -400, 3000, -650, -130, 70, 1300, 5000, 3400, -150, -790, -3210, -1000, 8500, -30, 200, -200, 340, -300, -20, 50, 400, -460, 430, 1000, 700, 50, 90]

const overalBalance = allMovements.reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance); // 17840

// OR we can use chaining to make it a lot nicer
const overalBalance2 = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance2); //17840

// OR we can also use flatMap
const overalBalance3 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
console.log(overalBalance3);

///////////////////
// Sorting Arrays

// Strings
const owners = [`Jonas`, `Zack`, `Adam`, `Martha`];
console.log(owners.sort()); // ['Adam', 'Jonas', 'Martha', 'Zack'] (Mutates the original array)

//Numbers
console.log(movements); //[200, 450, -400, 3000, -650, -130, 70, 1300]
console.log(movements.sort()); //[-130, -400, -650, 1300, 200, 3000, 450, 70] since it sorts them as strings we get an unordered array

// if it returna < 0   a, b (keep order)
// if it returns > 0   b, a (switch order)

//Ascending
movements.sort((a, b) => {
  if (a > b) return 1;
  if (a < b) return -1;
});
console.log(movements); // [-650, -400, -130, 70, 200, 450, 1300, 3000]
//OR to simplifly it
movements.sort((a, b) => a - b);

//Descending
movements.sort((a, b) => {
  if (a > b) return -1;
  if (a < b) return 1;
});
console.log(movements); //[3000, 1300, 450, 200, 70, -130, -400, -650]
// OR
movements.sort((a, b) => b - a);
