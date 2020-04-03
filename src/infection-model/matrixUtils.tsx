import ndarray from "ndarray";

export function getRowView(matrix: ndarray, rowIndex: number) {
  return matrix.lo(rowIndex).hi(1);
}

export function getColView(matrix: ndarray, colIndex: number) {
  return matrix.lo(0, colIndex).hi(matrix.shape[0], 1);
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
