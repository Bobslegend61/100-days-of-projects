// Classes

interface ISubscribers {
  publish: (value: any) => void;
}

interface ICalculatorButton {
  subscribe: (subscriber: ISubscribers) => void;
}
class CalculatorButton implements ICalculatorButton {
  private subscribers: ISubscribers[] = [];
  constructor(private btn: HTMLDivElement) {
    const self = this;
    self.btn.addEventListener("click", function () {
      self.subscribers.forEach((subscriber) =>
        subscriber.publish(this.dataset.value),
      );
    });
  }

  subscribe: (subscriber: ISubscribers) => void = (subscriber) => {
    this.subscribers.push(subscriber);
  };
}

interface ICalculatorScreen extends ISubscribers {}
class CalculatorScreen implements ICalculatorScreen {
  private screenEl = document.querySelector<HTMLDivElement>(
    ".calculator__screen",
  );

  publish: (value: string) => void = (value) => {
    if (this.screenEl?.children.length === 1) {
      const firstValue: string | null = this.screenEl?.children?.item(
        this.screenEl.children.length - 1,
      )!.textContent;

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

    if (
      "%+-*/.".includes(
        this.screenEl?.children.item(this.screenEl.children.length - 1)
          ?.textContent!,
      )
    ) {
      if ("%+-*/.".includes(value)) {
        this.removeFromScreen();
      }

      if (value === "=") return;
    }

    if (value === "=") {
      value = this.calculate();
      this.clearAll();
    }

    const el = this.createScreenText(value);
    this.addToScreen(el);
  };

  private createScreenText: (value: string) => HTMLSpanElement = (value) => {
    const span: HTMLSpanElement = document.createElement("span");
    const text: Text = document.createTextNode(value);
    span.appendChild(text);
    if ("/*%-+".includes(value)) {
      span.classList.add("divide");
    }

    return span;
  };

  private checkPercent: () => string = () => {
    if (!this.screenEl?.children.length) return "0";

    let prevValues = "";
    Array.from(this.screenEl!.children).forEach((el) => {
      prevValues += el.textContent;
    });

    const value = eval(`${prevValues} / 100`);
    this.clearAll();
    return value;
  };

  private calculate: () => string = () => {
    let answer: any = "";
    if (!this.screenEl?.children.length) {
      answer = "0";
    } else if (this.screenEl?.children.length === 1) {
      answer = this.screenEl.children?.item(
        this.screenEl.children.length - 1,
      )?.textContent;

      this.removeFromScreen();
    } else {
      let formatted = "";
      Array.from(this.screenEl!.children).forEach((el) => {
        formatted += el.textContent;
      });
      answer = eval(formatted).toString();
    }

    return answer.trim();
  };

  private addToScreen: (el: HTMLSpanElement) => void = (el) => {
    this.screenEl?.appendChild(el);
  };

  private removeFromScreen: () => void = () => {
    this.screenEl?.children.item(this.screenEl.children.length - 1)?.remove();
  };

  private clearAll: () => void = () => {
    Array.from(this.screenEl!.children).forEach((el) => el.remove());
  };

  private clearOne: () => void = () => {
    if (
      !this.screenEl?.children.length ||
      this.screenEl?.children.length === 1
    ) {
      this.removeFromScreen();
      const el = this.createScreenText("0");
      this.addToScreen(el);
    } else {
      this.removeFromScreen();
    }
  };
}

interface ICalculator {}

class Calculator implements ICalculator {
  private screen: ICalculatorScreen = new CalculatorScreen();
  private btns: ICalculatorButton[] = [
    ...document.querySelectorAll<HTMLDivElement>(
      ".calculator__buttons--button",
    ),
  ].map((btn) => new CalculatorButton(btn));

  constructor() {
    this.btns.forEach((btn) => btn.subscribe(this.screen));
  }
}

const app = new Calculator();
