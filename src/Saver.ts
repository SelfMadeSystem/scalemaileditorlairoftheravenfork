export type JSONVal =
  | string
  | number
  | boolean
  | null
  | JSONVal[]
  | { [key: string]: JSONVal };

export type JSONObj = { [key: string]: JSONVal };

export interface SaveData {
  saveTo(): JSONObj;
  loadFrom(data: JSONObj): void;
}

const DEF_LS_KEY = "scalemail-data";

export class Saver {
  public localStorageKey = DEF_LS_KEY;
  constructor(
    private saveDatas: {
      [key: string]: SaveData;
    },
    private postSave?: () => void,
    private postLoad?: () => void
  ) {
    // // Call saveToLocalStorage every 5 minutes (300000 milliseconds)
    // setInterval(() => {
    //   this.saveToLocalStorage();
    // }, 300000);

    // // Call saveToLocalStorage before the user closes the tab
    // window.addEventListener("beforeunload", () => {
    //   this.saveToLocalStorage();
    // });
  }

  public saveTo(): Map<string, JSONObj> {
    const data = new Map<string, JSONObj>();
    for (const [key, saveData] of Object.entries(this.saveDatas)) {
      data.set(key, saveData.saveTo());
    }
    return data;
  }

  public saveToString(): string {
    return JSON.stringify(Object.fromEntries(this.saveTo()));
  }

  public saveToLocalStorage(key = this.localStorageKey) {
    localStorage.setItem(key, this.saveToString());

    this.postSave?.();
  }

  public clearLocalStorage(key = this.localStorageKey) {
    localStorage.removeItem(key);
  }

  public loadFrom(data: Map<string, JSONObj>) {
    for (const [key, saveData] of Object.entries(this.saveDatas)) {
      const stuff = data.get(key);
      if (typeof stuff === "object") {
        saveData.loadFrom(stuff);
      }
    }

    this.postLoad?.();
  }

  public loadFromString(data: string) {
    const stuff = JSON.parse(data);
    if (typeof stuff === "object" && stuff) {
      this.loadFrom(new Map(Object.entries(stuff)));
    }
  }

  public loadFromLocalStorage(key = this.localStorageKey) {
    const data = localStorage.getItem(key);
    if (data !== null) {
      this.loadFromString(data);
    }
  }
}
