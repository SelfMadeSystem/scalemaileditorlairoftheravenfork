import { Scale } from "./Scale";

export class PatternMatrix {
  public matrix: Scale[][] = [];

  public height = 0;
  public width = 0;

  public physicalHeight = 0;
  public physicalWidth = 0;

  // Matrix Functions
  clearMatrix() {
    this.matrix = [];
    this.height = 0;
    this.width = 0;
  }

  copyMatrix(target: PatternMatrix) {
    this.matrix = target.matrix;
    this.getSize();
  }

  // loadMatrix(matrix) {
  //   var x = 0;
  //   var s = 0;
  //   var y = matrix.length;
  //   var z = matrix[0].length;

  //   newPattern(this, z, y, false);

  //   for (x = 0; x < y; x++) {
  //     for (s = 0; s < z; s++) {
  //       this.colourScale(x, s, matrix[x][s].colour);
  //     }
  //   }
  // };

  getSize() {
    // Store Matrix Size
    this.height = this.matrix.length;
    this.width = this.matrix[0].length;

    // Calculate Physical Size
    if (this.height > 0 && this.width > 0) {
      // Find corners
      var firstRow = this.findFirstColour("row", 1);
      var lastRow = this.findFirstColour("row", 0);

      var firstCol = this.findFirstColour("col", 1);
      var lastCol = this.findFirstColour("col", 0);

      // Determine Physical Size of Pattern
      if (firstRow && firstCol && lastRow && lastCol) {
        // Calculate Physical Size
        this.physicalHeight = lastRow[0] - firstRow[0];
        this.physicalWidth = lastCol[1] - firstCol[1];

        if (
          this.matrix[firstCol[0]][0].colour == 0 ||
          this.matrix[this.height - 1 - lastCol[0]][0].colour == 0
        ) {
          this.physicalWidth -= 0.5;
        }

        // if (firstRow[0] === false && lastRow[0] === false) {
        //   this.physicalHeight = 0;
        // } else {
        this.physicalHeight += 1;
        // }

        // if (firstCol[1] === false && lastCol[1] === false) {
        //   this.physicalWidth = 0;
        // } else {
        this.physicalWidth += 1;
        // }
      }
    }
  }

  findFirstColour(mode: "col" | "row", direction: 0 | 1 = 1) {
    var colX = 0;
    var colY = 0;

    var rowX = 0;
    var rowY = 0;
    var rowZ = 0;

    switch (mode) {
      case "col":
        rowY = this.height;

        if (direction == 1) {
          colX = 0;
          colY = this.width;

          for (; colX < colY; colX++) {
            if (this.matrix[0][0].colour == 0) {
              rowX = 0;
              rowZ = 1;
            } else {
              rowX = 1;
              rowZ = 0;
            }

            for (; rowX < rowY; rowX += 2) {
              if (this.matrix[rowX][colX].colour > 1) {
                return [rowX, colX];
              }
            }

            for (; rowZ < rowY; rowZ += 2) {
              if (this.matrix[rowZ][colX].colour > 1) {
                return [rowZ, colX];
              }
            }
          }
        } else {
          colX = this.width - 1;
          colY = 0;

          for (; colX > colY; colX--) {
            if (this.matrix[0][0].colour == 0) {
              rowX = this.height - 2;
              rowZ = this.height - 1;
            } else {
              rowX = this.height - 1;
              rowZ = this.height - 2;
            }

            for (; rowX > 0; rowX -= 2) {
              if (this.matrix[rowX][colX].colour > 1) {
                return [rowX, colX];
              }
            }

            for (; rowZ > 0; rowZ -= 2) {
              if (this.matrix[rowZ][colX].colour > 1) {
                return [rowZ, colX];
              }
            }
          }
        }

        break;

      case "row":
        colY = this.width;

        if (direction == 1) {
          rowX = 0;
          rowY = this.height;

          for (; rowX < rowY; rowX++) {
            for (colX = 0; colX < colY; colX++) {
              if (this.matrix[rowX][colX].colour > 1) {
                return [rowX, colX];
              }
            }
          }
        } else {
          rowX = this.height - 1;
          rowY = 0;

          for (; rowX > rowY; rowX--) {
            for (colX = this.width - 1; colX > 0; colX--) {
              if (this.matrix[rowX][colX].colour > 1) {
                return [rowX, colX];
              }
            }
          }
        }

        break;
    }

    return undefined;
  }

  // Scale Functions
  colourScale(y: number, x: number, colour: number, expand = false) {
    // Auto Expand Pattern
    if (expand === true) {
      var height = this.height;
      var width = this.width;

      if (colour > 1) {
        if (y == 0) {
          this.addRow(0);
          this.width = width;
          this.fillRow(0, 1);
          this.getSize();

          y += 1;
        } else if (y == height - 1) {
          this.addRow(height);
          this.fillRow(height, 1);
          this.getSize();
        }

        if (x == 0) {
          this.addColumn(1, 0);

          x += 1;
        } else if (x == width - 1 && this.matrix[y][0].colour != 0) {
          this.addColumn(1, width);
        }
      }
    }

    // Set Colour
    this.matrix[y][x].setColour(colour);
    this.getSize();
  }

  getColour(y: number, x: number) {
    return this.matrix[y][x].colour;
  }

  // Row Functions
  addRow(position: number = -1) {
    this.matrix.splice(position, 0, []);
  }

  fillRow(row: number, colour: number) {
    var x = 0;
    var y = this.width;
    var inset = false;

    if (this.matrix[row].length === 0) {
      // Create Scales
      for (x = 0; x < y; x++) {
        this.matrix[row].push(new Scale(colour));
      }
    } else {
      for (x = 0; x < y; x++) {
        this.matrix[row][x].colour = colour;
      }
    }

    // Inset Scale
    if (this.height > 0) {
      if (row == 0) {
        if (this.matrix[row + 1][0].colour != 0) {
          inset = true;
        }
      } else {
        if (this.matrix[row - 1][0].colour != 0) {
          inset = true;
        }
      }
    } else {
      inset = true;
    }

    if (inset === true) {
      this.matrix[row][0].colour = 0;
    }
  }

  removeRow(position: number) {
    try {
      this.matrix.splice(position, 1);
      this.getSize();
    } catch (err) {
      console.log("Remove Row - That matrix position doesn't exist!");
    }
  }

  // Column Functions
  addColumn(colour: number, position: number = -1) {
    try {
      var x = 0;
      var y = this.matrix.length;

      for (x = 0; x < y; x++) {
        this.matrix[x].splice(position, 0, new Scale(colour));

        if (position == 0 && this.matrix[x][1].colour == 0) {
          this.matrix[x][0].colour = 0;
          this.matrix[x][1].colour = 1;
        }
      }

      this.getSize();
    } catch (err) {
      console.log("Add Column - That matrix position doesn't exist!");
    }
  }

  fillColumn(column: number, row: number, colour: number) {
    for (let x = 0 + row % 2; x < this.matrix.length; x+=2) {
      this.matrix[x][column].setColour(colour);
    }
  }

  removeColumn(position: number) {
    try {
      for (let x = 0; x < this.matrix.length; x++) {
        this.matrix[x].splice(position, 1);
      }

      this.getSize();
    } catch (err) {
      console.log("Remove Column - That matrix position doesn't exist!");
    }
  }

  // Fill Functions

  validPosition(y: number, x: number) {
    return (
      y >= 0 && y < this.matrix.length && x >= 0 && x < this.matrix[0].length
    );
  }

  validPositionC(y: number, x: number, colour: number) {
    if (this.validPosition(y, x)) {
      return this.getColour(y, x) === colour;
    }
    return false;
  }

  fill(y: number, x: number, colour: number) {
    let c = this.getColour(y, x);
    if (c === colour) return;

    this.matrix[y][x].colour = colour;

    //offset X : y % 2 == (this.matrix.length % 2)
    let inset = false;

    // Inset Scale
    if (this.height > 0) {
      if (y == 0) {
        if (this.matrix[y + 1][0].colour != 0) {
          inset = true;
        }
      } else {
        if (this.matrix[y - 1][0].colour != 0) {
          inset = true;
        }
      }
    } else {
      inset = true;
    }

    for (let y1 = -1; y1 < 2; y1 += 2) {
      for (let x1 = inset ? -1 : 0; x1 <= (inset ? 0 : 1); x1++) {
        if (this.validPositionC(y + y1, x + x1, c)) {
          this.fill(y + y1, x + x1, colour);
          // editorPattern.colourScale(y + y1, x + x1, colour, false);
          // swatches.generatePatternSwatch(editorPattern);
          // editorLayer.redrawCanvas();
          // drawBg();
        }
      }
    }
  }

  replaceAll(c1: number, c2: number) {
    if (c1 === c2) return;
    let maxY = this.matrix.length;
    let maxX = this.matrix[0].length;
    for (var y = 0; y < maxY; y++) {
      for (var x = 0; x < maxX; x++) {
        if (this.getColour(y, x) === c1) {
          this.matrix[y][x].colour = c2;
          // editorPattern.colourScale(y, x, c2, false);
          // swatches.generatePatternSwatch(editorPattern);
          // editorLayer.redrawCanvas();
          // drawBg();
        }
      }
    }
  }
}
