export const generateQuartersInRange = (startQuarter:string, endQuarter:string)=> {
    const quarters = ["K1", "K2", "K3", "K4"];
    const startYear = parseInt(startQuarter.slice(0, 4));
    const endYear = parseInt(endQuarter.slice(0, 4));
    const startQuarterIndex = quarters.indexOf(startQuarter.slice(4));
    const endQuarterIndex = quarters.indexOf(endQuarter.slice(4));
    const quartersInRange = [];
  
    for (let year = startYear; year <= endYear; year++) {
        let start = 0;
        let end = quarters.length - 1;
  
        if (year === startYear) {
            start = startQuarterIndex;
        }
  
        if (year === endYear) {
            end = endQuarterIndex;
        }
  
        for (let i = start; i <= end; i++) {
            quartersInRange.push(`${year}${quarters[i]}`);
        }
    }
  
    return quartersInRange;
  }