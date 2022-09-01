export type nodesType = {id:number,name:string}
export type edgesType = {fromId:number,toId:number}
export type graphType = {
  nodes:Array<nodesType>,
  edges:Array<edgesType>
}
export type dataType = Array<graphType>;

declare global {
  interface Window {
    __mockServerReady: any;
    __merchantMockServerReady:any
  }
}