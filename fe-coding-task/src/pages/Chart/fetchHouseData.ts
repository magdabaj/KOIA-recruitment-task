

const url ="https://data.ssb.no/api/v0/no/table/07241" 
export type houseTypeValue  =  '00' |  '02'  | '03'   

export const fetchHouseData = async (quarters: Array<string>, houseType: houseTypeValue) =>  {
    try {
        const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      query: [
        {
          code: "Boligtype",
          selection: {
              filter: "item",
              values: [
                  houseType
              ]
          }
      },
      {
          code: "ContentsCode",
          selection: {
          filter: "item",
              values: [
                  "KvPris"
              ]
          }
      },
      {
          code: "Tid",
          selection: {
              filter: "item",
              values: quarters
          }
      }
      ]
    })
    
  })


  const data = await response.json()
  return data.value
} catch (error) {
   console.log("Ann error occured", error)
  }

}