"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const contentEl = document.querySelector(".content");
const buttonsWrap = document.querySelector(".buttons");
const timeEl = document.querySelector("#time");
const startBtn = document.getElementById("start");
class Timmer {
    constructor(time) {
        this.time = time;
        this.subscribers = [];
        this.timmerInterval = null;
        this.finish = null;
        this.setFinish = (fn) => (this.finish = fn);
        this.subscribe = (sub) => {
            this.subscribers.push(sub);
            return () => {
                this.subscribers.filter((subs) => subs.name !== sub.name);
            };
        };
        this.start = () => {
            this.timmerInterval = setInterval(() => {
                var _a;
                this.time--;
                if (this.time === 0) {
                    clearInterval(this.timmerInterval);
                    (_a = this.finish) === null || _a === void 0 ? void 0 : _a.call(this);
                }
                this.subscribers.forEach((sub) => sub.publish(this.time));
            }, 1000);
        };
        if (time <= 0) {
            this.time = 50;
        }
    }
}
class TimmerSubs {
    constructor(name) {
        this.name = name;
        this.publish = (currentTime) => {
            timeEl.innerText = currentTime.toString();
        };
    }
}
class Questions {
    //   private totalScore: number = 0;
    constructor(questions) {
        this.questions = questions;
        this.currentQuestion = 0;
        this.render = () => {
            var _a, _b;
            const self = this;
            (_a = self.questions[this.currentQuestion]) === null || _a === void 0 ? void 0 : _a.addButtonCheck(self.buttonCheck);
            (_b = self.questions[this.currentQuestion]) === null || _b === void 0 ? void 0 : _b.render();
            buttonsWrap.innerHTML = `
        <button class="button prev">Prev</button>
        <span>${this.currentQuestion + 1} / ${this.questions.length}</span>
        <button class="button next">Next</button>
    `;
            document
                .querySelectorAll(".buttons .button")
                .forEach((element) => element.addEventListener("click", function () {
                if (this.innerText === "NEXT") {
                    self.next();
                }
                else {
                    self.prev();
                }
            }));
            self.buttonCheck();
        };
        this.next = () => {
            this.currentQuestion++;
            this.render();
        };
        this.prev = () => {
            this.currentQuestion--;
            this.render();
        };
        this.finish = () => {
            var _a;
            let score = 0;
            this.questions.forEach((question) => {
                if (question.getAnswer() === question.getChooseAnswer()) {
                    score++;
                }
                else {
                    score = score > 0 ? score - 1 : 0;
                }
            });
            document.querySelector(".container").innerHTML = `
        <h4>Your Score: ${score} point(s)</h4>

        <button class="reset button">Reset</button>
      `;
            (_a = document
                .querySelector(".reset")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => location.reload());
        };
        this.buttonCheck = () => {
            var _a, _b, _c, _d, _e, _f;
            if (this.currentQuestion === 0) {
                (_a = document
                    .querySelector(".prev")) === null || _a === void 0 ? void 0 : _a.setAttribute("disabled", "true");
            }
            if (this.currentQuestion === this.questions.length - 1) {
                if (this.questions[this.currentQuestion].getChooseAnswer() &&
                    document.querySelector(".finish")) {
                    (_b = document
                        .querySelector(".finish")) === null || _b === void 0 ? void 0 : _b.removeAttribute("disabled");
                }
                else {
                    (_c = document.querySelector(".next")) === null || _c === void 0 ? void 0 : _c.remove();
                    const finishBtn = document.createElement("button");
                    const btnText = document.createTextNode("Finish");
                    finishBtn.appendChild(btnText);
                    finishBtn.classList.add("button", "finish");
                    finishBtn.addEventListener("click", this.finish);
                    if (!this.questions[this.currentQuestion].getChooseAnswer()) {
                        finishBtn.setAttribute("disabled", "true");
                    }
                    buttonsWrap === null || buttonsWrap === void 0 ? void 0 : buttonsWrap.appendChild(finishBtn);
                }
            }
            if (this.currentQuestion > 0) {
                (_d = document
                    .querySelector(".prev")) === null || _d === void 0 ? void 0 : _d.removeAttribute("disabled");
            }
            if (this.currentQuestion < this.questions.length - 1 &&
                this.questions[this.currentQuestion].getChooseAnswer()) {
                (_e = document
                    .querySelector(".next")) === null || _e === void 0 ? void 0 : _e.removeAttribute("disabled");
            }
            else {
                (_f = document
                    .querySelector(".next")) === null || _f === void 0 ? void 0 : _f.setAttribute("disabled", "true");
            }
        };
    }
}
class QuestionWithOptions {
    constructor(question, options, answer) {
        this.question = question;
        this.options = options;
        this.answer = answer;
        this.choosenAnswer = null;
        this.buttonCheck = null;
        this.addButtonCheck = (fn) => (this.buttonCheck = fn);
        this.getAnswer = () => this.answer;
        this.getChooseAnswer = () => this.choosenAnswer;
        this.render = () => {
            const self = this;
            const options = self.options.map((value, index) => `
        <div class="option ${(self === null || self === void 0 ? void 0 : self.choosenAnswer) === value ? "selected" : ""}">
            <span>${index + 1}.</span>
            <p>${value}</p>
        </div>
    `);
            contentEl.innerHTML = `
        <h4>${self.question}</h4>
        <div class="options">
            ${options.join("")}
        </div>
      `;
            document.querySelectorAll(".option").forEach((element) => element.addEventListener("click", function () {
                var _a;
                document
                    .querySelectorAll(".option")
                    .forEach((element) => element.classList.remove("selected"));
                this.classList.add("selected");
                self.choosenAnswer = this.children[1].textContent;
                (_a = self.buttonCheck) === null || _a === void 0 ? void 0 : _a.call(self);
            }));
        };
    }
}
startBtn === null || startBtn === void 0 ? void 0 : startBtn.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    startBtn.innerText = "Fetching Questions...";
    const difficulty = ["easy", "medium", "hard"];
    const categories = [
        9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
        28, 29, 30, 31, 32,
    ];
    const questionsURL = `https://opentdb.com/api.php?amount=50&category=${categories[Math.round(Math.random() * (categories.length - 1))]}&difficulty=${difficulty[Math.round(Math.random() * (difficulty.length - 1))]}&type=multiple`;
    try {
        const res = yield fetch(questionsURL);
        const quizQuestions = yield res.json();
        const qq = quizQuestions.results.map(({ question, correct_answer, incorrect_answers }) => {
            incorrect_answers.splice(Math.round(Math.random() * (incorrect_answers.length - 1)), 0, correct_answer);
            const textarea = document.createElement("textarea");
            textarea.innerHTML = correct_answer;
            const answer = textarea.value;
            return new QuestionWithOptions(question, incorrect_answers, answer);
        });
        if (!qq.length)
            throw new Error("Cannot find question at the moment, please try again.");
        const timmer = new Timmer(1200);
        timmer.subscribe(new TimmerSubs("NavTime"));
        const questions = new Questions(qq);
        timmer.setFinish(questions.finish);
        const p = document.createElement("p");
        const text = document.createTextNode(quizQuestions.results[0].category);
        p.append(text);
        p.style.marginBottom = "10px";
        (_a = document.querySelector(".container")) === null || _a === void 0 ? void 0 : _a.prepend(p);
        questions.render();
        timmer.start();
    }
    catch (error) {
        console.log(error);
        startBtn.innerText = "Start";
        alert(error ||
            "Opps something went wrong. check your internet, reload and try again");
    }
}));
