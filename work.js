const symbol = {
  'RECIPROCAL': '\\', 'SQRT': '√', 'DIVIDE': '÷',
  'MULTIPLY': '*', 'SUBTRACT': '-', 'ADD': '+',
  'EQUAL': '='
};

$("button[name='number']").on('click', function () {
  addNumber($(this).val());
});

$("button[name='operator']").on('click', function () {
  addOperator(symbol[$(this).val()]);
});

let inValue = 0; // 上一次计算的结果（若只存在一个操作数，认为两个操作数一致）
let disValue = null; // 本次计算输入的数字、计算的最终结果
let preValue = 0; // 记录上一次输入
let operator = { current: '', next: '', hold: '' }; // 操作符（本次的和下一次的）

function calculate(func, inV, disV) {
  let preV = preValue;
  if (disValue == null) {
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

function setResult() {
  let inV = Number(inValue);
  let disV = Number(disValue); // 规定dis为字符串类型，方便操作
  if (disValue != null)
    preValue = disV;

  switch (operator.current) {
    case '+':
      calculate((x, y) => { return x + y; }, inV, disV);
      break;
    case '-':
      calculate((x, y) => { return x - y; }, inV, disV);
      break;
    case '*':
      calculate((x, y) => { return x * y; }, inV, disV);
      break;
    case '÷':
      calculate((x, y) => { return x / y; }, inV, disV);
      break;
    case '√':

      break;
    case '\\':

      break;
    case '=':
      if (operator.next == '=') {
        operator.current = operator.hold;
        setResult();
      } else {
        operator.current = '';
        setResult();
      }
      break;
    default:
      if (disValue != null)
        inValue = disV.toString();
      disValue = inValue.toString();
      break;
    // 1. (√)（没有输入时默认存在操作数0）只输入一个操作数，=之前没有操作符（例如：disValue = 3，operator = ''）
    // 2. (√)输入一个操作数和一个操作符。再进行计算（例如：disValue = 4，operator = '+'）
    // 3. (√)输入两个操作数和一个操作符（例如：disValue = 4，operator = '+'，inValue = 3）
  }
}

function addOperator(nextOp) {
  if (disValue == Infinity || disValue == -Infinity)
    return;

  operator.next = nextOp;
  if (nextOp != '=')
    operator.hold = nextOp;

  // 计算结果
  setResult();

  // 打印到输出和结果栏，存在特殊情况（等号等）
  if (nextOp == '=') {
    // 相关的变换操作由setResult()完成
    if (disValue == Infinity || disValue == -Infinity) {
      $('#out').text('除数は0ではならない');
      return;
    }
    else if (operator.hold == '') {
      $('#in').text(disValue + ' =');
      $('#out').text(disValue);
    }
    else {
      $('#in').text(inValue + ' ' + operator.hold + ' ' + preValue + ' =');
      $('#out').text(disValue);
    }
  } else if (nextOp == '\\') {

  } else if (nextOp == '√') {

  } else {
    $('#in').text(disValue + ' ' + nextOp);
    $('#out').text(disValue);
  }

  inValue = disValue; // 记录上一次计算的结果
  disValue = null;
  operator.current = nextOp; // 计算根据上一次的操作符进行（若有，Operator中保存本次的操作符）
}

function addNumber(numStr) {
  if (disValue == Infinity || disValue == -Infinity)
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

}

function clearDisplay() {
  inValue = 0;
  disValue = null;
  preValue = 0;
  operator.current = '';
  $('#in').text('');
  $('#out').text('0');
}