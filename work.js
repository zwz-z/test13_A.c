const symbol_dis = {
  'RECIPROCAL': '\\', 'SQRT': '√', 'DIVIDE': '÷',
  'MULTIPLY': '×', 'SUBTRACT': '-', 'ADD': '+',
  'EQUAL': '='
};

const symbol = {
  'RECIPROCAL': '\\', 'SQRT': '√', 'DIVIDE': '/',
  'MULTIPLY': '*', 'SUBTRACT': '-', 'ADD': '+',
  'EQUAL': '='
};

function IsInvalidInput() {
  return disValue == Infinity || disValue == -Infinity || disValue == 'NaN';
}

function IsSpecialOp(op) {
  return op == '\\' || op == '√';
}

$("button[name='number']").on('click', function () {
  AddNumber($(this).val());
});

$("button[name='operator']").on('click', function () {
  AddOperator(symbol_dis[$(this).val()]);
});

$('#change').on('click', () => {
  changeSymbol();
})

$('#clear').on('click', () => {
  clearDisplay();
})

$(document).on('keydown', function (keydown) {
  let key = keydown.key;
  if (key == '.') {
    AddNumber(key);
    return;
  }
  for (let i = 0; i < 10; i++)
    if (key == i) {
      AddNumber(i.toString());
      return;
    }

  for (op in symbol)
    if (key == symbol[op]) {
      AddOperator(symbol_dis[op]);
      return;
    }

  if (key == 'Escape')
    clearDisplay();
})

let inValue = 0; // 上一次计算的结果（若只存在一个操作数，认为两个操作数一致）
let disValue = null; // 本次计算输入的数字、计算的最终结果
let preValue = 0; // 记录上一次输入
let operator = { current: '', next: '', hold: '' }; // 操作符（本次的和下一次的）

function Calculate(func, inV, disV) {
  let preV = preValue;
  if (disValue == null && !IsSpecialOp(operator.next)) {
    disValue = inV;
    if (operator.next == '=') {
      if ($('#in').text().split(' ').length > 2)
        disValue = func(disValue, preV);
      else {
        preValue = disValue;
        disValue = func(disValue, inV);
      }
    }
    disValue = disValue.toString();
  }
  else
    disValue = func(inV, disV).toString();
}

function CalculateSp(func, disV) {
  let result = 0;
  if (disValue == null)
    result = func(Number($('#out').text()));
  else
    result = func(disV);
  return result;
}

function SetResult() {
  let inV = Number(inValue);
  let disV = Number(disValue); // 规定dis为字符串类型，方便操作
  if (disValue != null)
    preValue = disV;

  if (operator.next == '\\')
    disV = CalculateSp((x) => { return 1 / x }, disV);

  else if (operator.next == '√')
    disV = CalculateSp((x) => { return Math.sqrt(x) }, disV);

  switch (operator.current) {
    case '+':
      Calculate((x, y) => { return x + y; }, inV, disV);
      break;
    case '-':
      Calculate((x, y) => { return x - y; }, inV, disV);
      break;
    case '×':
      Calculate((x, y) => { return x * y; }, inV, disV);
      break;
    case '÷':
      Calculate((x, y) => { return x / y; }, inV, disV);
      break;
    case '=':
      if (operator.next == '=') {
        operator.current = operator.hold;
        SetResult();
      } else {
        operator.current = '';
        SetResult();
      }
      break;
    default:
      if (disValue != null)
        inValue = disV.toString();
      if (IsSpecialOp(operator.next))
        disValue = disV.toString();
      else
        disValue = inValue.toString();
      break;
    // 1. (√)（没有输入时默认存在操作数0）只输入一个操作数，=之前没有操作符（例如：disValue = 3，operator = ''）
    // 2. (√)输入一个操作数和一个操作符。再进行计算（例如：disValue = 4，operator = '+'）
    // 3. (√)输入两个操作数和一个操作符（例如：disValue = 4，operator = '+'，inValue = 3）
  }
}

function DisplaySp(str, strErr) {
  if (IsInvalidInput()) {
    $('#in').text(`${str}(${preValue})`);
    $('#out').text(strErr);
    return false;
  }

  if (IsSpecialOp(operator.current) || operator.current == '=' || operator.current == '') {
    $('#in').text(`${str}(${preValue})`);
    $('#out').text(disValue);
  }
  else {
    $('#in').text(`${inValue} ${operator.current} ${str}(${preValue})`);
    if (str == '√')
      preValue = CalculateSp((x) => { return Math.sqrt(x) }, preValue);
    else if (str == '1/')
      preValue = CalculateSp((x) => { return 1 / x }, preValue);
    $('#out').text(preValue);
  }

  return true;
}

function AddOperator(nextOp) {
  if (IsInvalidInput())
    return;

  operator.next = nextOp;
  if (!(IsSpecialOp(nextOp) || nextOp == '='))
    operator.hold = nextOp;

  // 计算结果
  SetResult();

  // 打印到输出和结果栏，存在特殊情况（等号等）
  if (nextOp == '=') {
    // 相关的变换操作由setResult()完成
    if (IsInvalidInput()) {
      $('#out').text('除数は0ではならない');
      return;
    }

    if (operator.current == '√')
      $('#in').text($('#in').text() + ' =');
    else if (operator.hold == '')
      $('#in').text(disValue + ' =');
    else
      $('#in').text(inValue + ' ' + operator.hold + ' ' + preValue + ' =');
    $('#out').text(disValue);

  } else if (nextOp == '\\') {
    if (!DisplaySp('1/', '除数は0ではならない'))
      return;
  } else if (nextOp == '√') {
    if (!DisplaySp('√', '無効な入力'))
      return;
  } else {
    $('#in').text(disValue + ' ' + nextOp);
    $('#out').text(disValue);
  }

  inValue = disValue; // 记录上一次计算的结果
  disValue = null;
  operator.current = nextOp; // 计算根据上一次的操作符进行（若有，Operator中保存本次的操作符）
}

function AddNumber(numStr) {
  if (IsInvalidInput())
    clearDisplay();
  else if (operator.hold != '' && operator.current == '=')
    $('#in').text('');

  if (disValue == null && numStr != '.')
    disValue = numStr;
  else if (disValue == null)
    disValue = 0 + numStr;
  else if (disValue != null &&
    disValue.includes('.') &&
    numStr == '.')
    return;
  else
    disValue += numStr;

  $('#out').text(disValue);
}

function changeSymbol() {
  let outStr = $('#out').text();
  if (outStr != '0') {
    let splitStr = outStr.split('');
    if (splitStr[0] == '-')
      splitStr.shift();
    else
      splitStr.unshift('-');
    disValue = splitStr.join('');
    $('#out').text(disValue);
  }

}

function clearDisplay() {
  inValue = 0;
  disValue = null;
  preValue = 0;
  operator.current = '';
  $('#in').text('');
  $('#out').text('0');
}