import { useEffect, useState } from "react"
import "./App.css"
import { createColumns, createEdges, splitColumns } from "./functions"
import { graphType } from "./types/Type"

function App() {
  const [graphs, setGraphs] = useState([])
  const [requestedGraph, setRequestedGraph] = useState<graphType>({
    nodes: [
      { id: 0, name: "node1" },
      { id: 1, name: "node2" },
    ],
    edges: [{ fromId: 0, toId: 1 }],
  })
  const [selectValue, setSelectValue] = useState(0)
  const [columns, setColumns] = useState([[{ fromId: 11, toId: 1 }]])
  const [contentColumns, setContentColumns] = useState([[0]])
  const [edges, setEdges] = useState([{}])
  const [selectedNode, setSelectedNode] = useState(0)
  const [template, setTemplate] = useState([[0]])

  const fetchGraph = async () =>{
    let response = await fetch(`/api/graphs/${selectValue}`)

    if (response.ok) {
      let json = await response.text();
      setRequestedGraph(JSON.parse(json))
    } else {
      alert("Ошибка HTTP: " + response.status);
    }
  } 
  
  const handleChange = (e:React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(parseInt(e.target.value))
  }

  useEffect(() =>{
    // При инициализации приложения происходила проблема с запросом к MSW до его старта,
    // поэтому я добавил задержку для того чтобы выполнить запрос после запуска MSW

    async function apiClient() {
      if (process.env.NODE_ENV === 'development') {
        
         const registration = await window.__mockServerReady ;
     
         console.log(
           'registration instanceof ServiceWorkerRegistration',
           registration instanceof ServiceWorkerRegistration 
         );
     
         if (!(registration instanceof ServiceWorkerRegistration)) {
           await new Promise((r) => setTimeout(r, 500));
         }
       }
      
      const response = await fetch('/api/graphs/')
      if (response.ok) {
            let json = await response.text();
            setGraphs(JSON.parse(json))
            fetchGraph()
          } else {
            alert("Ошибка HTTP: " + response.status);
          }
     }
     apiClient()
  },[])
  
  useEffect(() =>{
    fetchGraph()
  },[selectValue])

  useEffect(() =>{
    setColumns(createColumns(requestedGraph))
  },[requestedGraph])

  useEffect(() =>{
    setContentColumns(splitColumns(columns))
  },[columns])

  useEffect(() =>{
    setEdges(createEdges({requestedGraph,contentColumns}))
  },[contentColumns])

  const dragStart =(id:number)=>{
    setSelectedNode(id)
  }
  const dragEnd =()=>{
    setSelectedNode(0)
    setContentColumns(template)
  }

  const dragOver = (evt:any) => {
    // Разрешаем сбрасывать элементы в эту область
    evt.preventDefault();
 
    const activeElement = selectedNode
    const Columns = [...contentColumns]
    // Находим элемент, над которым в данный момент находится курсор
    const currentElement = parseInt(evt.target.getAttribute('id'))
    // Проверяем, что событие сработало:
    // 1. не на том элементе, который мы перемещаем,
    // 2. именно на элементе списка
    const isMoveable = activeElement !== currentElement
    // Если нет, прерываем выполнение функции

    let currentid = 0 
    let currentcol = 0
    let deleteEl = 0
    if (!!isMoveable) {
      for (let i = 0; i < contentColumns.length; i++){
        for (let j = 0; j < contentColumns[i].length; j++){
          if(currentElement === contentColumns[i][j]){
            if(contentColumns[i].some((i)=>i === activeElement)){
              if (j < contentColumns[i].indexOf(activeElement)){
                currentid = j
                currentcol = i
                deleteEl = contentColumns[i].indexOf(activeElement) + 1
              }else{
                currentid = j + 1
                currentcol = i
                deleteEl = contentColumns[i].indexOf(activeElement)
              }
            }

          }
        }
      }
    }

    if (!!isMoveable) {
      let arr = [...Columns[currentcol]]
      arr.splice(currentid, 0 , activeElement)
      arr.splice(deleteEl, 1)
      Columns[currentcol] = arr
    }
    setTemplate(Columns)
  }


  return(
    <div className="wrapper">
      <div>
      <select value={selectValue} onChange={ handleChange }>
        {graphs.map((id,index) => 
        {return <option 
          key={index}
          value={index}
        >
        {index}
        </option>})}
      </select>
      <div className="columns">
        {
          contentColumns.map((column, index) => 
          {return <div 
            className="column" 
            key={index}
            >
            {column.map((node, nodeIndex) =>{return <div className="nodeWrapper">
            <div
             className="node" 
             key={nodeIndex} 
             draggable="true"
             onDragStart={()=>dragStart(node)}
             onDragEnd={()=>dragEnd()}
             onDragOver={dragOver}
             id={String(node)}
             >
            {requestedGraph.nodes.filter(
              (i) => i.id === node).map(
              (j) => {return <div id={String(node)} >{j.name}</div>}
              )}</div>
              </div>})}
              </div>})
        }
        <div className="edge">
          {edges.map((edge:any) => {return <div >
            <svg  xmlns="http://www.w3.org/2000/svg">
              <line 
              x1={edge.x1} 
              y1={edge.y1} 
              x2={edge.x2} 
              y2={edge.y2} 
              stroke="#000" />
            </svg>
          </div> 
          })} 
        </div>           
      </div>
      </div>
    </div>
  )
}

export default App;
