//global variables

//bootstrap tooltip
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

//algebra library
let Expression = algebra.Expression;
let Fraction = algebra.Fraction;
let Equation = algebra.Equation;

//solution required input variables
const gCo = document.getElementById("gCo");
const gSpd = document.getElementById("gSpd");
const iBrg = document.getElementById("iBrg");
const iRng = document.getElementById("iRng");
const fBrg = document.getElementById("fBrg");
const fRng = document.getElementById("fRng");
const manSpd = document.getElementById("manSpd");
const mySelect = document.getElementById("mySelect");
const givenLabel = document.getElementById("givenLabel");
const given = document.getElementById("given");
const answerLabel = document.querySelector(".answer p");
const scale = document.querySelector(".scale")

//app buttons
calBtn = document.getElementById("calc");
drawBtn = document.getElementById("draw");
resetBtn = document.getElementById("reset");

//data and layout options needed for ploting (drawing)
let diagnose = [];
let data = [];
let layout = {
  margin: {
    t: 25
  },
  legend: {
    "orientation": "h"
  },
  modebar: {
    remove: ["zoom", "lasso2d"]
  },
  polar: {
    radialaxis: {
      // visible: true,
    },
    angularaxis: {
      direction: "clockwise",
    },
  },
};

//helpers functions
//trig functions
function sin(a) {
  if (a === 0 || a === 180 || a === -180) {
    return 0;
  }
  return Math.sin(a * Math.PI / 180);
}

function cos(a) {
  if (a === 90 || a === -90 || a === 270) {
    return 0;
  }
  return Math.cos(a * Math.PI / 180);
}

function tan(a) {
  if (a === 90 || a === -90) {
    return undefined;
  }
  if (a === 180 || a === -180) {
    return 0;
  }
  return Math.tan(a * Math.PI / 180);
}

function shiftTan(a) {
  if (a.x === 0 && a.y === 0) {
    return 0;
  }
  if (a.x === 0 && a.y > 0) {
    return 90;
  }
  if (a.x === 0 && a.y < 0) {
    return -90;
  }
  return round2(Math.atan(a.y / a.x) * 180 / Math.PI)
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

// subtract two vectors
function subtractVectors(e, f) {
  return {
    x: e.x - f.x,
    y: e.y - f.y,
  };
}

// add two vectors
function addVectors(e, f) {
  return {
    x: e.x + f.x,
    y: e.y + f.y,
  };
}

// magnitude of vector
function magVector(vector) {
  let x = Math.pow(vector.x, 2) + Math.pow(vector.y, 2);
      x = Math.sqrt(x);
      x = round2(x)
  return x;
}

//find vector data from co/spd brg/rng
function vectorizeData(cB, sR) {
  let vector = {
    x: round2(sR * sin(cB)),
    y: round2(sR * cos(cB)),
  };

  vector.mag = sR;
  vector.cetaR = shiftTan(vector);
  vector.course = cB;

  if (vector.x >= 0 && vector.y >= 0) {
    vector.quad = "first quad";
  };
  if (vector.x >= 0 && vector.y <= 0) {
    vector.quad = "second quad";
  };
  if (vector.x <= 0 && vector.y <= 0) {
    vector.quad = "third quad";
  };
  if (vector.x < 0 && vector.y > 0) {
    vector.quad = "forth quad";
  };
  if (vector.x === 0 && vector.y === 0) {
    vector.quad = "";
  };
  return vector;
}

//find vector data from x and y
function deVectorizeData(x, y) {
  let vector = {
    x: x,
    y: y
  };
  vector.mag = magVector(vector);
  vector.cetaR = shiftTan(vector);

  if (vector.x >= 0 && vector.y >= 0) {
    vector.course = 90 - Math.abs(vector.cetaR);
    vector.quad = "first quad";
  }
  if (vector.x >= 0 && vector.y <= 0) {
    vector.course = 90 + Math.abs(vector.cetaR);
    vector.quad = "second quad";
  }
  if (vector.x <= 0 && vector.y <= 0) {
    vector.course = 270 - Math.abs(vector.cetaR);
    vector.quad = "third quad";
  }
  if (vector.x < 0 && vector.y > 0) {
    vector.course = 270 + Math.abs(vector.cetaR);
    vector.quad = "forth quad";
  }
  if (vector.x === 0 && vector.y === 0) {
    vector.course = 0;
    vector.quad = "";
  };
  return vector;
}

//find straight line equation
// y= mx+c
function stLineEq(ceta, point) {
  let stLineData = {};
      stLineData.x = point.x;
      stLineData.y = point.y;
  //when straight line is prependicular to the x-axis
  if (Math.abs(ceta) === 90) {
    stLineData.m = undefined;
    stLineData.c = undefined;
    stLineData.eq = point.x;
    return stLineData;
  }
  //any other angle to the x-axis
  let m = tan(ceta);
  let c = point.y - (point.x * m);
  stLineData.m = round2(m);
  stLineData.c = round2(c);
  stLineData.eq = `${stLineData.m} * x + (${stLineData.c})`;
  return stLineData;
}

//find circle equation
function circleEq(r, point) {
  return `(${point.x})^2+(${point.y})^2-${r*r}=0`
};

//change string from equation solving to a number
function numerize(string) {
  let myNumsString = string.split(",");
  let test1 = myNumsString[0].split("/");
  let test2;
  let num1;
  let num2;

  if (test1.length === 1) {
    num1 = parseFloat(test1[0]);
  }

  if (test1.length === 2) {
    num1 = parseFloat(test1[0]) / parseFloat(test1[1]);
  }

  if (myNumsString.length === 2) {
    test2 = myNumsString[1].split("/");

    if (test2.length === 1) {
      num2 = parseFloat(test2[0]);
    }

    if (test2.length === 2) {
      num2 = parseFloat(test2[0]) / parseFloat(test2[1]);
    }
  }
  return [num1, num2]
}

// find intersection points between st line equation (Relative Movement) and a circle equation (Manuvering Speed)
function solCirLine(ceta, point, r) {
  // y= mx+c -->(1)straight line equation
  let stEq = stLineEq(ceta, point);
  let cirEq = "";
  let eq;
  let myNums;
  let answer = {point1:{},point2:{},};
  //when straight line is prependicular to the x-axis substitute x
  if (Math.abs(ceta) === 90) {
    cirEq = circleEq(r, {x: stEq.eq, y: "y"});
    // parse equation
    eq = algebra.parse(cirEq);
    // solve equation
    eq = eq.solveFor("y");
    eq = eq.toString();
    //
    myNums = numerize(eq);
    //
    //two intersection points
    answer.point1.x = point.x;
    answer.point1.y = myNums[0];
    answer.point2.x = point.x;
    answer.point2.y = myNums[1];
    return answer
  }
  // x^2+y^2-r^2 = 0 -->(2)circle equation --> substitute (1) in (2)
  cirEq = circleEq(r, {x: "x", y: stEq.eq});
  // parse equation
  eq = algebra.parse(cirEq);
  // solve equation
  eq = eq.solveFor("x");
  if (eq.length === 0) {
    console.log("there is no answer (intersection points)");
    return
  }
  eq = eq.toString();
  //
  myNums = numerize(eq);
  //
  //two intersection points
  answer.point1.x =  myNums[0];
  answer.point1.y = stEq.m * myNums[0] + stEq.c;
  answer.point2.x = myNums[1];
  answer.point2.y = stEq.m * myNums[1] + stEq.c;
  return answer
}

//determine which point is the same direction as iPosition --> fPosition
function whichPoint(intersecPoints, guideVector, relVector) {
  let answer1 = subtractVectors(intersecPoints.point1, guideVector);
  let answer2 = subtractVectors(intersecPoints.point2, guideVector);
      answer1 = deVectorizeData(answer1.x, answer1.y);
      answer2 = deVectorizeData(answer2.x, answer2.y);

  let chosen = [];

  if (relVector.quad === answer1.quad) {
    chosen.push(answer1);
  };

  if (relVector.quad === answer2.quad) {
    chosen.push(answer2);
  };
  // if (0 < (relVector.course - answer2.course) < 1)) {
  //   console.log("diff acceptable");
  // };
  return chosen
};

//function to give course and manuvering time given --> manuvering speed
function coTime(guideVector, m1m2, given) {
  //solving steps
  let intersecPoints = solCirLine(m1m2.cetaR, guideVector, given);
  let relVectors = whichPoint(intersecPoints, guideVector, m1m2);
  let shipVector = addVectors(guideVector, relVectors[0]);
      shipVector = deVectorizeData(shipVector.x, shipVector.y);
////
//diagnose and analysis
diagnose.push("intersecPoints", intersecPoints, "relVectors", relVectors);
////
  //displaying answer
  answerLabel.innerHTML = `Ship Course : ${Math.round(shipVector.course)} <br>
  Manuvering Time : ${Math.round(m1m2.mag / relVectors[0].mag * 60)} min.`;
  answerLabel.style.visibility = "visible";

  if (relVectors.length === 2) {
    let shipVector2 = addVectors(guideVector, relVectors[1]);
        shipVector2 = deVectorizeData(shipVector2.x, shipVector2.y);
    ////
    //diagnose and analysis
    diagnose.push("shipVector2", shipVector2);
    ////
    answerLabel.innerHTML += `<br> OR <br> Ship Course : ${Math.round(shipVector2.course)} <br>
    Manuvering Time : ${Math.round(m1m2.mag / relVectors[1].mag * 60)} min.`;
  }

  return shipVector;
}

//function to give speed and manuvering time given --> manuvering course
function spdTime(guideVector, m1m2, given) {
  //solving steps
  let stLine1 = stLineEq(m1m2.cetaR, guideVector);
  let ship = vectorizeData(given, 1);
  let stLine2 = stLineEq(ship.cetaR, {x: 0, y: 0,});
  let shipVector = {};

  //when one straight line is prependicular to the x-axis substitute x
  if(Math.abs(m1m2.cetaR) === 90) {
    shipVector.x = stLine1.x;
    shipVector.y = stLine2.m * stLine1.x + stLine2.c;
    console.log("here1");
  }

  if (Math.abs(ship.cetaR) === 90) {
    shipVector.x = stLine2.x;
    shipVector.y = stLine1.m * stLine2.x + stLine1.c;
    console.log("here2");
  }

  //when straight line is prependicular to the x-axis substitute x
  if (Math.abs(m1m2.cetaR) !== 90 && Math.abs(ship.cetaR) !== 90) {
    let eq = algebra.parse(`${stLine1.eq} = ${stLine2.eq}`);
    eq = eq.solveFor("x");
    eq = eq.toString();
    let num = numerize(eq);

    shipVector.x = num[0];
    shipVector.y = stLine1.m * num[0] + stLine1.c;
    console.log("here3");
  }

  shipVector = deVectorizeData(shipVector.x, shipVector.y);
  // should check Relative direction if in same direction as m1m2....
  let relVector = subtractVectors(shipVector, guideVector);
      relVector = deVectorizeData(relVector.x, relVector.y);
      console.log(m1m2.course,relVector.course,shipVector.course);
  //displaying answer
  answerLabel.innerHTML = `Ship Speed : ${Math.round(shipVector.mag)} knots<br>
  Manuvering Time : ${Math.round(m1m2.mag / relVector.mag * 60)} min`;
  answerLabel.style.visibility = "visible";

  return shipVector
}

//function to give course and minmum manuvering speed
function coMinSpd(guideVector, m1m2) {
  let shipVector = {};
  //solving steps
  let stLine1 = stLineEq(m1m2.cetaR, guideVector);
//special case
  //m1m2 parallel to x-axis
  if (m1m2.cetaR === 0) {
    shipVector.x = 0;
    shipVector.y = stLine1.c;
    shipVector = deVectorizeData(shipVector.x, shipVector.y);
    return shipVector
  }
  //m1m2 prependicular to x-axis
  if (m1m2.cetaR === 90) {
    shipVector.x = stLine1.eq;
    shipVector.y = 0;
    shipVector = deVectorizeData(shipVector.x, shipVector.y);
    return shipVector
  }
//resume normal cases solving steps
  let prependicular = Math.pow(stLine1.m, -1) * -1;
  let stLine2 = `${prependicular} * x`;
  //solve two lines
  let eq = algebra.parse(`${stLine1.eq} = ${stLine2}`);
  eq = eq.solveFor("x");
  eq = eq.toString();
  //intersection point
  let num = numerize(eq);
  //ship data
  shipVector.x =  num[0];
  shipVector.y = stLine1.m * num[0] + stLine1.c;
  shipVector = deVectorizeData(shipVector.x, shipVector.y);

  let relVector = subtractVectors(shipVector, guideVector);
      relVector = deVectorizeData(relVector.x, relVector.y);

  if (m1m2.quad === relVector.quad) {
    //displaying answer
    answerLabel.innerHTML = `Ship Course : ${Math.round(shipVector.course)} <br>
    Min. Manuvering Speed : ${Math.round(shipVector.mag)} Knots <br>
    Manuvering Time : ${Math.round(m1m2.mag / relVector.mag * 60)} min`;
    answerLabel.style.visibility = "visible";

    return shipVector;
  } else {
    answerLabel.innerHTML = "minmum speed should be greater than guide speed";
  }
}

//function to give course and manuvering speed given --> manuvering time
function coSpd(guideVector, m1m2, given) {
  //solving steps
  let relSpd = m1m2.mag / (given / 60);
  let relVector = vectorizeData(m1m2.course, relSpd);
  let shipVector = addVectors(guideVector, relVector);
      shipVector = deVectorizeData(shipVector.x, shipVector.y);

  //displaying answer
  answerLabel.innerHTML = `Ship Course : ${Math.round(shipVector.course)} <br>
  Manuvering Speed : ${Math.round(shipVector.mag)} konts`;
  answerLabel.style.visibility = "visible";

  return shipVector;
}

//draw answer on a Manuvering board
function draw() {
  drawBtn.setAttribute("disabled", true);
  Plotly.newPlot("myDiv", data, layout);
  scale.style.visibility = "visible"

}

// clear plotdiv(#myDiv), input, data.
function reset() {
  mySelect.options.selectedIndex = 0;
  calBtn.removeAttribute("disabled");
  answerLabel.style.visibility = "hidden";
  scale.style.visibility = "hidden";
  document.querySelectorAll("input").forEach((input) => {
    input.value = "";
  });
  document.getElementById("myDiv").innerHTML = "";
  data = [];
}

//calculating depending on selection --> (#mySelect)
function cal() {
  let guideVector = vectorizeData(gCo.valueAsNumber, gSpd.valueAsNumber);
  let iPosVector = vectorizeData(iBrg.valueAsNumber, iRng.valueAsNumber);
  let fPosVector = vectorizeData(fBrg.valueAsNumber, fRng.valueAsNumber);
  let m1m2 = subtractVectors(fPosVector, iPosVector);
      m1m2 = deVectorizeData(m1m2.x, m1m2.y);

  //diagnose and analysis
  diagnose.push("guideVector", guideVector, "m1", iPosVector, "m2", fPosVector, "m1m2", m1m2);

  let shipVector;

  switch (mySelect.options.selectedIndex) {
    case 0:
      mySelect.options.selectedIndex = 3;
      shipVector = coMinSpd(guideVector, m1m2);
      break;
    case 1:
      shipVector = coTime(guideVector, m1m2, given.valueAsNumber);
      break;
    case 2:
      shipVector = spdTime(guideVector, m1m2, given.valueAsNumber);
      break;
    case 3:
      shipVector = coMinSpd(guideVector, m1m2);
      break;
    case 4:
      shipVector = coSpd(guideVector, m1m2, given.valueAsNumber);
      break;
  }
  //diagnose and analysis
  diagnose.push("shipVector", shipVector);

  data = [
    {
    type: 'scatterpolar',
    r: [0, gSpd.value],
    theta: [0, gCo.value],
    name: "guide",
    marker: {
      color: "blue"
    }
  },
    {
    type: 'scatterpolar',
    r: [iRng.value, fRng.value],
    theta: [iBrg.value, fBrg.value],
    name: "m1m2",
    marker: {
      color: "black"
    }
  },
    {
    type: 'scatterpolar',
    r: [0, shipVector.mag],
    theta: [0, shipVector.course],
    name: "ship",
    marker: {
      color: "red"
    }
  },
    {
    type: 'scatterpolar',
    r: [gSpd.value, shipVector.mag],
    theta: [gCo.value, shipVector.course],
    name: "relVectors",
    marker: {
      color: "green"
    },
  }];
  calBtn.setAttribute("disabled", true);
  drawBtn.removeAttribute("disabled");
}

//addEventListener to buttons
calBtn.addEventListener("click", cal);
drawBtn.addEventListener("click", draw);
resetBtn.addEventListener("click", reset);

//scale increase
document.querySelector("#inc").addEventListener("click", () => {
  //distScale += 0.5;
  data[1].r[0] /= 0.5;
  data[1].r[1] /= 0.5;

  Plotly.newPlot("myDiv", data, layout);
  //document.querySelector(".scale p").innerHTML = `X ${distScale}`;
});

//scale decrease
document.querySelector("#dec").addEventListener("click", () => {
  //distScale -= 0.5;
  data[1].r[0] *= 0.5;
  data[1].r[1] *= 0.5;

  Plotly.newPlot("myDiv", data, layout);
  //document.querySelector(".scale p").innerHTML = `X ${distScale}`;
});

mySelect.addEventListener('change', (event) => {
  switch (event.target.value) {
    case "0":
      given.setAttribute("disabled", true);
      givenLabel.innerHTML = "";
      given.placeholder = "";
      given.value = "";
      break;
    case "1":
      given.removeAttribute("disabled");
      givenLabel.innerHTML = "Speed";
      given.placeholder = "Spd";
      given.value = "";
      break;
    case "2":
      given.removeAttribute("disabled");
      givenLabel.innerHTML = "Course";
      given.placeholder = "Co";
      given.value = "";
      break;
    case "3":
      given.setAttribute("disabled", true);
      givenLabel.innerHTML = "";
      given.placeholder = "";
      given.value = "";
      break;
    case "4":
      given.removeAttribute("disabled");
      givenLabel.innerHTML = "Time";
      given.placeholder = "min";
      given.value = "";
      break;
    default:
  };
});
