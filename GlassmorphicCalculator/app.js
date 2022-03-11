"use strict";
// Classes
class CalculatorButton {
    constructor(btn) {
        this.btn = btn;
        this.subscribers = [];
        this.subscribe = (subscriber) => {
            this.subscribers.push(subscriber);
        };
        const self = this;
        self.btn.addEventListener("click", function () {
            self.subscribers.forEach((subscriber) => subscriber.publish(this.dataset.value));
        });
    }
}
class CalculatorScreen {
    constructor() {
        this.screenEl = document.querySelector(".calculator__screen");
        this.publish = (value) => {
            var _a, _b, _c, _d, _e;
            if (((_a = this.screenEl) === null || _a === void 0 ? void 0 : _a.children.length) === 1) {
                const firstValue = (_c = (_b = this.screenEl) === null || _b === void 0 ? void 0 : _b.children) === null || _c === void 0 ? void 0 : _c.item(this.screenEl.children.length - 1).textContent;
                if (firstValue === "0" && !"+-*/.".includes(value)) {
                    this.removeFromScreen();
                }
                if (value === "=") {
                    value = this.calculate();
                }
            }
            if (value === "%") {
                value = this.checkPercent();
            }
            if (value === "AC") {
                this.clearAll();
                value = "0";
            }
            if (value === "MC") {
                this.clearOne();
                return;
            }
            if ("%+-*/.".includes((_e = (_d = this.screenEl) === null || _d === void 0 ? void 0 : _d.children.item(this.screenEl.children.length - 1)) === null || _e === void 0 ? void 0 : _e.textContent)) {
                if ("%+-*/.".includes(value)) {
                    this.removeFromScreen();
                }
                if (value === "=")
                    return;
            }
            if (value === "=") {
                value = this.calculate();
                this.clearAll();
            }
            const el = this.createScreenText(value);
            this.addToScreen(el);
        };
        this.createScreenText = (value) => {
            const span = document.createElement("span");
            const text = document.createTextNode(value);
            span.appendChild(text);
            if ("/*%-+".includes(value)) {
                span.classList.add("divide");
            }
            return span;
        };
        this.checkPercent = () => {
            var _a;
            if (!((_a = this.screenEl) === null || _a === void 0 ? void 0 : _a.children.length))
                return "0";
            let prevValues = "";
            Array.from(this.screenEl.children).forEach((el) => {
                prevValues += el.textContent;
            });
            const value = eval(`${prevValues} / 100`);
            this.clearAll();
            return value;
        };
        this.calculate = () => {
            var _a, _b, _c, _d;
            let answer = "";
            if (!((_a = this.screenEl) === null || _a === void 0 ? void 0 : _a.children.length)) {
                answer = "0";
            }
            else if (((_b = this.screenEl) === null || _b === void 0 ? void 0 : _b.children.length) === 1) {
                answer = (_d = (_c = this.screenEl.children) === null || _c === void 0 ? void 0 : _c.item(this.screenEl.children.length - 1)) === null || _d === void 0 ? void 0 : _d.textContent;
                this.removeFromScreen();
            }
            else {
                let formatted = "";
                Array.from(this.screenEl.children).forEach((el) => {
                    formatted += el.textContent;
                });
                answer = eval(formatted).toString();
            }
            return answer.trim();
        };
        this.addToScreen = (el) => {
            var _a;
            (_a = this.screenEl) === null || _a === void 0 ? void 0 : _a.appendChild(el);
        };
        this.removeFromScreen = () => {
            var _a, _b;
            (_b = (_a = this.screenEl) === null || _a === void 0 ? void 0 : _a.children.item(this.screenEl.children.length - 1)) === null || _b === void 0 ? void 0 : _b.remove();
        };
        this.clearAll = () => {
            Array.from(this.screenEl.children).forEach((el) => el.remove());
        };
        this.clearOne = () => {
            var _a, _b;
            if (!((_a = this.screenEl) === null || _a === void 0 ? void 0 : _a.children.length) ||
                ((_b = this.screenEl) === null || _b === void 0 ? void 0 : _b.children.length) === 1) {
                this.removeFromScreen();
                const el = this.createScreenText("0");
                this.addToScreen(el);
            }
            else {
                this.removeFromScreen();
            }
        };
    }
}
class Calculator {
    constructor() {
        this.screen = new CalculatorScreen();
        this.btns = [
            ...document.querySelectorAll(".calculator__buttons--button"),
        ].map((btn) => new CalculatorButton(btn));
        this.btns.forEach((btn) => btn.subscribe(this.screen));
    }
}
const app = new Calculator();
