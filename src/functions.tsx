import { edgesType, graphType } from "./types/Type"

type createEdges = {requestedGraph:graphType,contentColumns:number[][]}
export const createEdges = ({requestedGraph ,contentColumns}:createEdges) => {
  //создаём массив с координатами для svg на основе edges
  let arr = [] as Array<{}>
  for (let i = 0; i < requestedGraph.edges.length; i++){
    let x1 = 0
    let y1 = 0
    let x2 = 0
    let y2 = 0
    //ищем узел и координаты стороны узла от которой исходит линия соединения
    // в каждом столбце и в каждой колонке 
    for (let j = 0; j < contentColumns.length; j++){
      for (let k = 0; k < contentColumns[j].length; k++){
        if(requestedGraph.edges[i].fromId === contentColumns[j][k]){
          x1 = (j+1) * 232
          y1 = (k+1) * 71 + 125
        }
      }
    }
    //ищем узел и  координаты стороны узла в которую приходит линия соединения
    // в каждом столбце и в каждой колонке 
    for (let j = 0; j < contentColumns.length; j++){
      for (let k = 0; k < contentColumns[j].length; k++){
        if(requestedGraph.edges[i].toId === contentColumns[j][k]){
          x2 = 100 + (j) * 232
          y2 = (k+1) * 71 + 125
        }
      }
    }
    // записываем каждое соединение в масссив
    arr.push({x1, y1, x2, y2})
  }
  // устанавливаем массив соединений в state,
  // затем подставляем координаты в каждый svg
  return arr
}

export const splitColumns = (columns:edgesType[][]) => {
  // эта функция разделяет столбцы с соединениями(edges) узлов
  // в отдельные столбцы с id узлов по которым будут отрисовываться элементы 
  let arr = [] as Array<number[]>
  for (let i = 0; i < columns.length; i++) {
    let column = [] as Array<number>
    for (let j = 0; j < columns[i].length; j++){
      column.every((item: number) => item !== columns[i][j].fromId)&&
      column.push(columns[i][j].fromId)
    }
    arr.push(column)
  }

  let lastColumn =[] as Array<number>
  for (let i = 0; i < columns[columns.length - 1].length; i++){
    lastColumn.every((item: number) => item !== columns[columns.length - 1][i].toId)&&
    lastColumn.push(columns[columns.length - 1][i].toId)
  }
  arr.push(lastColumn)
  return arr
}

export const createColumns = (requestedGraph:graphType) => {
  // распределяем массив соединений(edges) в колонки

  //первая колонка
  let columnContainer = [] as Array<edgesType[]>
  let firstColumn = requestedGraph.edges.filter((i:edgesType) => 
  requestedGraph.edges.every((item:edgesType) => 
  i.fromId !== item.toId) )
  columnContainer.push(firstColumn)

  // остальные колонки
  let createColumn = (previousColumn:edgesType[]) => {
    let newColumn = [] as Array<edgesType>
    for (let i = 0; i < previousColumn.length; i++) {
      for (let j = 0; j < requestedGraph.edges.length; j++) {
        if (previousColumn[i].toId === requestedGraph.edges[j].fromId) {
          newColumn.every((item : edgesType) => item !== requestedGraph.edges[j]) &&
          newColumn.push(requestedGraph.edges[j])
        }
      }
    }
    newColumn.length > 0 && columnContainer.push(newColumn)
  }

  for (let i = 0; i < requestedGraph.edges.length; i++) {
    columnContainer.length === 1? 
    createColumn(columnContainer[0]):
    createColumn(columnContainer[columnContainer.length - 1])
  }
  return columnContainer
}