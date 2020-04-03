// helpers for the ndarray package
import ndarray from "ndarray";

export function getRowView(matrix: ndarray, rowIndex: number) {
  return matrix.hi(rowIndex + 1).lo(rowIndex);
}

export function getColView(matrix: ndarray, colIndex: number) {
  return matrix.hi(matrix.shape[0], colIndex + 1).lo(0, colIndex);
}

export function getAllValues(matrixView: ndarray) {
  const values = [];
  for (let i = 0; i < matrixView.shape[0]; ++i) {
    for (let j = 0; j < matrixView.shape[1]; ++j) {
      values.push(matrixView.get(i, j));
    }
  }
  return values;
}

export function setRowValues(
  matrix: ndarray,
  rowIndex: number,
  values: number[],
) {
  const rowView = getRowView(matrix, rowIndex);
  values.forEach((value, colIndex) => {
    rowView.set(0, colIndex, value);
  });
}
