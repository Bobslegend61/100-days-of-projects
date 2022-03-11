const contentEl: HTMLElement | null = document.querySelector(".content");
const buttonsWrap: HTMLElement | null = document.querySelector(".buttons");
const timeEl: HTMLElement | null = document.querySelector("#time");
const startBtn: HTMLElement | null = document.getElementById("start");

// timmer interface
interface ITimmer {
  subscribe: (sub: ITimmerSubscribers) => () => void;
  start: () => void;
}

class Timmer implements ITimmer {
  private subscribers: ITimmerSubscribers[] = [];
  private timmerInterval: number | null = null;
  private finish: (() => void) | null = null;
  constructor(private time: number) {
    if (time <= 0) {
      this.time = 50;
    }
  }

  setFinish: (fn: () => void) => void = (fn) => (this.finish = fn);

  subscribe: (sub: ITimmerSubscribers) => () => void = (sub) => {
    this.subscribers.push(sub);

    return () => {
      this.subscribers.filter((subs) => subs.name !== sub.name);
    };
  };

  start: () => void = () => {
    this.timmerInterval = setInterval(() => {
      this.time--;
      if (this.time === 0) {
        clearInterval(this.timmerInterval!);
        this.finish?.();
      }

      this.subscribers.forEach((sub) => sub.publish(this.time));
    }, 1000);
  };
}

// timmer subscribers interface
interface ITimmerSubscribers {
  name: string;
  publish: (currentTime: number) => void;
}

class TimmerSubs implements ITimmerSubscribers {
  constructor(public name: string) {}
  publish: (currentTime: number) => void = (currentTime) => {
    timeEl!.innerText = currentTime.toString();
  };
}

// Questions interface
interface IQuestions {
  render: () => void;
  next: () => void;
  prev: () => void;
  buttonCheck: () => void;
  finish: () => void;
}

class Questions implements IQuestions {
  private currentQuestion: number = 0;
  //   private totalScore: number = 0;
  constructor(private questions: IQuestion[]) {}

  render: () => void = () => {
    const self = this;
    self.questions[this.currentQuestion]?.addButtonCheck(self.buttonCheck);
    self.questions[this.currentQuestion]?.render();
    buttonsWrap!.innerHTML = `
        <button class="button prev">Prev</button>
        <span>${this.currentQuestion + 1} / ${this.questions.length}</span>
        <button class="button next">Next</button>
    `;

    document
      .querySelectorAll<HTMLButtonElement>(".buttons .button")
      .forEach((element) =>
        element.addEventListener("click", function () {
          if (this.innerText === "NEXT") {
            self.next();
          } else {
            self.prev();
          }
        }),
      );

    self.buttonCheck();
  };

  next: () => void = () => {
    this.currentQuestion++;
    this.render();
  };

  prev: () => void = () => {
    this.currentQuestion--;
    this.render();
  };

  finish: () => void = () => {
    let score = 0;
    this.questions.forEach((question) => {
      if (question.getAnswer() === question.getChooseAnswer()) {
        score++;
      } else {
        score = score > 0 ? score - 1 : 0;
      }
    });

    document.querySelector<HTMLDivElement>(".container")!.innerHTML = `
        <h4>Your Score: ${score} point(s)</h4>

        <button class="reset button">Reset</button>
      `;

    document
      .querySelector<HTMLButtonElement>(".reset")
      ?.addEventListener("click", () => location.reload());
  };

  buttonCheck: () => void = () => {
    if (this.currentQuestion === 0) {
      document
        .querySelector<HTMLButtonElement>(".prev")
        ?.setAttribute("disabled", "true");
    }

    if (this.currentQuestion === this.questions.length - 1) {
      if (
        this.questions[this.currentQuestion].getChooseAnswer() &&
        document.querySelector<HTMLButtonElement>(".finish")
      ) {
        document
          .querySelector<HTMLButtonElement>(".finish")
          ?.removeAttribute("disabled");
      } else {
        document.querySelector<HTMLButtonElement>(".next")?.remove();

        const finishBtn = document.createElement("button");
        const btnText = document.createTextNode("Finish");
        finishBtn.appendChild(btnText);
        finishBtn.classList.add("button", "finish");

        finishBtn.addEventListener("click", this.finish);

        if (!this.questions[this.currentQuestion].getChooseAnswer()) {
          finishBtn.setAttribute("disabled", "true");
        }
        buttonsWrap?.appendChild(finishBtn);
      }
    }

    if (this.currentQuestion > 0) {
      document
        .querySelector<HTMLButtonElement>(".prev")
        ?.removeAttribute("disabled");
    }

    if (
      this.currentQuestion < this.questions.length - 1 &&
      this.questions[this.currentQuestion].getChooseAnswer()
    ) {
      document
        .querySelector<HTMLButtonElement>(".next")
        ?.removeAttribute("disabled");
    } else {
      document
        .querySelector<HTMLButtonElement>(".next")
        ?.setAttribute("disabled", "true");
    }
  };
}

// Question interface
interface IQuestion {
  question: string;
  options: unknown;
  getAnswer: () => unknown;
  getChooseAnswer: () => unknown;
  render: () => void;
  addButtonCheck: (fn: () => void) => void;
}

class QuestionWithOptions implements IQuestion {
  private choosenAnswer: string | null = null;
  private buttonCheck: (() => void) | null = null;
  constructor(
    public question: string,
    public options: string[],
    private answer: string,
  ) {}

  addButtonCheck: (fn: () => void) => void = (fn) => (this.buttonCheck = fn);
  getAnswer: () => string = () => this.answer;
  getChooseAnswer: () => string | null = () => this.choosenAnswer;

  render: () => void = () => {
    const self = this;
    const options = self.options.map(
      (value, index) => `
        <div class="option ${self?.choosenAnswer === value ? "selected" : ""}">
            <span>${index + 1}.</span>
            <p>${value}</p>
        </div>
    `,
    );

    contentEl!.innerHTML = `
        <h4>${self.question}</h4>
        <div class="options">
            ${options.join("")}
        </div>
      `;

    document.querySelectorAll<HTMLDivElement>(".option").forEach((element) =>
      element.addEventListener("click", function () {
        document
          .querySelectorAll<HTMLDivElement>(".option")
          .forEach((element) => element.classList.remove("selected"));
        this.classList.add("selected");
        self.choosenAnswer = this.children[1].textContent;
        self.buttonCheck?.();
      }),
    );
  };
}

startBtn?.addEventListener("click", async () => {
  startBtn.innerText = "Fetching Questions...";
  const difficulty: string[] = ["easy", "medium", "hard"];
  const categories: number[] = [
    9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
    28, 29, 30, 31, 32,
  ];

  const questionsURL: string = `https://opentdb.com/api.php?amount=50&category=${
    categories[Math.round(Math.random() * (categories.length - 1))]
  }&difficulty=${
    difficulty[Math.round(Math.random() * (difficulty.length - 1))]
  }&type=multiple`;

  try {
    const res = await fetch(questionsURL);
    const quizQuestions: {
      response_code: number;
      results: {
        category: string;
        type: string;
        difficulty: string;
        question: string;
        correct_answer: string;
        incorrect_answers: string[];
      }[];
    } = await res.json();

    const qq = quizQuestions.results.map(
      ({ question, correct_answer, incorrect_answers }) => {
        incorrect_answers.splice(
          Math.round(Math.random() * (incorrect_answers.length - 1)),
          0,
          correct_answer,
        );

        const textarea: HTMLTextAreaElement =
          document.createElement("textarea");
        textarea.innerHTML = correct_answer;
        const answer = textarea.value;

        return new QuestionWithOptions(question, incorrect_answers, answer);
      },
    );

    if (!qq.length)
      throw new Error("Cannot find question at the moment, please try again.");

    const timmer = new Timmer(1200);
    timmer.subscribe(new TimmerSubs("NavTime"));
    const questions = new Questions(qq);
    timmer.setFinish(questions.finish);
    const p: HTMLParagraphElement = document.createElement<"p">("p");
    const text: Text = document.createTextNode(
      quizQuestions.results[0].category,
    );
    p.append(text);
    p.style.marginBottom = "10px";
    document.querySelector(".container")?.prepend(p);
    questions.render();
    timmer.start();
  } catch (error) {
    console.log(error);
    startBtn.innerText = "Start";
    alert(
      error ||
        "Opps something went wrong. check your internet, reload and try again",
    );
  }
});
