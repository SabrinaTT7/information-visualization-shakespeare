
count_words = (line) => {
    const word_array = line.split(" ");
    return word_array.length
  }
calcPlaySet = (data) => {
    let playSet = new Set();
       
        data.forEach(element => {
        
        if (!(playSet.has(element.Play))){
          //new play
      
          playSet.add(element.Play);
        }
       
      });
    return playSet;
      
}

// //I took this function from this notebook: https://observablehq.com/@d3/working-with-color
function darken(color, k = 1) {
    const {l, c, h} = d3.lch(color);
    return d3.lch(l - 18 * k, c, h);
  }

//I took this functino from this stack overflow post: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}



calcPlayData = (data, playSet) => {
    let playObjs = [];
  let count = 0;
  
  playSet.forEach(element => {
    const playObj = {play: element, lines: 0, id: count };
    playObjs.push(playObj);
    count +=1;
    
    
    
  });
  //this is going to be terrible time complexity unfortunately
  
  data.forEach(element => {
    playObjs.forEach(play => {
      //pos_count += playObj
      if (play.play == element.Play){
        play.lines += 1;
        
      }
    });
  });
    let posCount = 1;
    //shakespeareData.forEach(element => {
    playObjs.forEach(play => {
      //posCount += playObj
      
      play.pos = posCount;
      posCount += play.lines;
        
      });
    return playObjs;
}

calcCharacterData = (data, playSet) => {
    let characterData = [];
    playSet.forEach(play => {
      let characterSet = new Set();
      const obj = {play: play};
      let temp_list = [];
      data.forEach(element => {
      
        if (element.Play === play){
    
          
          if (!characterSet.has(element.Player)){
            characterSet.add(element.Player);
            temp_list.push({character: element.Player, lines: 1});

          }
          else {
            
            temp_list.forEach(elem => {
              if (elem.character == element.Player){
                elem.lines = elem.lines + 1;
              };
            });
          };
          
        };
     
      });
      obj.characters = temp_list;
      characterData.push(obj);
   
 });
  
    //shakespeareData.forEach(element => {
    characterData.forEach(play => {
      //posCount += playObj
      let posCount = 1;
      play.characters.forEach(character => {
        character.pos = posCount;
        posCount += character.lines;
      });
      
      
        
      });
  return characterData;
}

createRect = (g, height, color)=>{
  
    g.append("rect")
      .attr("x", 70)
      .attr("y", 0) // 10 pts padding on top
      .attr("width", 10)
      .attr("height", height)
      .style("fill", color);
    
  }
  createBook = (g, height, color, playName)=>{
    // console.log("HELLOOO");
    // console.log(playName);
    // console.log(height);
    // console.log(parseInt(height));
  
    g.append("rect")
      .attr("x", 70)
      .attr("y", 0) 
      .attr("width", 25)
      .attr("height", height)
      .style("fill", color);
  
    g.append("rect")
      .attr("x", 70)
      .attr("y", 5) 
      .attr("width", 25)
      .attr("height", 5)
      .style("fill", darken(color));
  
    g.append("rect")
      .attr("x", 70)
      .attr("y", height -10) 
      .attr("width", 25)
      .attr("height", 5)
      .style("fill", darken(color));
  
    g.append("text")
      .attr("text-anchor", "middle")
        .attr("x", 82)
        .attr("y", height /2)
        .style("font-weight", "bold")
        .style("font-size","12px")
        .text(playName[0].toUpperCase())
    
    
  }
  createVerticalLines = (g, givenCharacter, y_loc, color_scale, fullData) => {
    //console.log(givenCharacter)
    g.selectAll("rect")
    .data(fullData.filter(data => data.Player === givenCharacter))
    // .join("circle")
    //     .attr("cx", 456)
    //     .attr("cy", 315)
    //     .attr("r", 5)
    //     .style("fill", "red")
    .join("rect")
       .attr("y", 200)//y_loc)
       .attr("x", 200)//(d, i) => i * 5)
       .attr("height", d => count_words(d.PlayerLine) * 20)
       .attr("width", 30)
       .style("fill", "red")
       .style("opacity", 1)
}
  createHorizontalLines = (g, givenPlay, y_loc, colorData, characterData, fullData, height) => {
    const relevantData = characterData.filter(play => play.play === givenPlay)

    const opacityScale = d3.scaleLinear().domain([0, 60]).range([.2,.99])
  

    characters = g.selectAll("rect")
      .data(relevantData[0].characters)
      .join("rect")
        .attr("y", 0)
        //.attr("x", (d, i) => d.pos/5 + 85 + 5* i)
        .attr("x",  (d, i) => 100)
        .attr("width", d => d.lines/5)
        .attr("height", height)
        .style("fill", colorData[givenPlay])
        //.transition().ease(d3.easeSin).duration(4000).attr("x", (d, i) => d.pos/5 + 85 + 5* i)
        .style("opacity", (d, i) => opacityScale(i))
        
    characters.append("title")
        .text(d => d.character)
    // characters.append("g")
        //.selectAll
        //.each(function(d, i) {
        //    createVerticalLines(d3.select(this), d.character, y_loc, color_scale, fullData)
        //})
    characters.transition().ease(d3.easeSin).duration(4000).attr("x", (d, i) => d.pos/5 + 100 + 5* i)
  }

  
async function drawVisualization(){
    const width = 1400;
    const height = 4000;

    let shakespeareData = await d3.csv('data/Shakespeare_data.csv');
    colorData = await d3.json('data/colors.json');
    shakespeareData = shuffle(shakespeareData);

    const myPlaySet = calcPlaySet(shakespeareData);
    

    const playData = calcPlayData(shakespeareData, myPlaySet);
    //globalPlayData = playData;
    // console.log(playData);

    const characterData = calcCharacterData(shakespeareData, myPlaySet);
    //console.log(characterData);
    //globalCharData = characterData;

    const svg = d3.select("#vis")
    .attr("viewbox", [0, 0, width, height])
    .style("height", `${height}px`)
    .style("width", `${width}px`);


  const color = d3.scaleOrdinal()
  .domain(playData.map(d => d.play)).range(d3.schemeCategory10)

//   const y = d3.scaleLinear()
//     .domain(playData.map(d => d.lines)).range([0,1200])

  let plays = svg.selectAll(".rectangle")
    .data(playData)
    .join(
      enter => enter.append("g")
        .attr("class", "rectangle")
        .attr("transform", (d,i)=> `translate(${0}, ${d.pos / 50 + i * 5 })`)
        .each(function(d,i){
          //createRect(d3.select(this), d => d.lines / 50, "#4eb8d3")//, d => d.Play)
          createBook(d3.select(this), d.lines / 50, "#4eb8d3", d.play)
        }),
      update => update
        .attr("transform", (d,i) => 'translate(500, 500)'),
      exit => (exit))
      //.attr("transform", (d,i)=> `translate(${0}, ${y(d.lines)})`)
      //.style("fill", "red")
    //   .each((o,p)=> {
    //       createRect(d3.select(this), o => o.lines / 50, o => color(d.play))
    //     }

    //okay so two options
    //could write a updatecount function
    //will it even work since we can't update x directly
    //   

  plays.append("title")
  .text(d=>d.play)

  
  let = plays.append("g")
      //.attr("class", "special")
      .each(function(d,i){
        createHorizontalLines(d3.select(this), d.play, d.lines/ 100, colorData, characterData, shakespeareData, d.lines /50)//"red")//d => color(d.id))
      })
   


}
drawVisualization()


