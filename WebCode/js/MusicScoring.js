var validationResults
var complexityOutput;
var colorCounter = 1;
var clickedRow;
var superTable;
var pieparts;
var histoExists = false;
var pieExists = false;
var legendExists = false;
var dagExists = false;
var tempVariableHolder;
var samplePieces;
var guesses;
var oldGuessIndex = -1;

$(document).on('ready', function(){
	$.ajax({
		context: this,
		dataType : "html",
		url : "navbar.htm",
		success : function(results) {
			$('#navholder').html(results);
            $("body").css("padding-top", "70px");
		}
	});
    $.ajax({
        context: this,
        dataType : "json",
        url : "PiecesWithParts.json",
        success : function(results) {
            samplePieces = results;
            setupPieceDropdown();
            updateMusicListener();
        }
    });

    updateDifficultyListener();

    $('#validationToHide').hide();
    $('#difficultyToHide').hide();
    $('.buttonToHide').hide();
});
$(document).on('click', '#ComplexityRunner', function () {
	var fileName = "MusicXMLs/" + getRealMusicPieceName() + ".xml";
    var difficultyVal = getRealDifficulty();
    var turnOnValidation = isValidationOn();

    var guessCheck = $("#worstMeasureGuesses")[0];
    
    var hiddenInputElem = $("#hiddenInputElem")[0];
    if (hiddenInputElem !== undefined && hiddenInputElem.value !== "" && oldGuessIndex != -1) {
        guesses[oldGuessIndex] = parseInt(hiddenInputElem.value, 10);
    }

	//Need some code here to execute the jar file with the specified parameters.
	$.ajax({
		type : "POST",
		url : "backend.php",
		data : {xmlName:fileName,difficulty:difficultyVal,validation:turnOnValidation},
		success : function(results) {
			var validationAndComplexity = $.parseJSON(results);
            tempVariableHolder = validationAndComplexity;
            complexityOutput = validationAndComplexity.scoreResults;
            validationResults = validationAndComplexity.validationResults[0];
			//$('#noResultsTemp').html('');
			//$('#resultholder').html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="retrievedData"></table>' );

			removePieAndLegend();

	    	removeHisto();

			if (superTable != undefined) {
				superTable.clear();
			}
			else {
				superTable = $('#retrievedData').DataTable({
			        "columns": [
			            { "title": "Instrument Name" },
			            { "title": "Total Complexity Score" },
			            { "title": "Toughest Measure Number" },
			            { "title": "Toughest Measure Complexity" },
			            { "title": "Note Complexity" },
			            { "title": "Interval Complexity" }
			        ]
			    } );
			}

            //var guessCorrect = false;
            //var correctPartNames = "";
            //var incorrectPartNames = "";
            var guessAnswers = "";
			var tempNames = [];
			var namesAndScores = [];
			var i = 0;
		    for (; i < complexityOutput.length; i++) {
		    	var item = complexityOutput[i];
		    	superTable.row.add( [
		            item.partName,
		            Math.floor(item.overallScore),
		            item.worstMeasureNumber,
		            Math.floor(item.worstMeasureValue),
		            Math.floor(item.noteTotal),
		            Math.floor(item.intervalTotal)
		        ] ).draw();
		        if (tempNames.indexOf(item.partName) == -1) {
		        	namesAndScores.push({partName:item.partName,total:Math.floor(item.overallScore)});
		        	tempNames.push(item.partName);
		        }
                /* Determining if guesses were correct. */
                if (guessCheck !== undefined) {
                    guessAnswers += item.partName + ": " + item.worstMeasureNumber + " (";

                    if (guesses[i] === item.worstMeasureNumber) {
                        guessAnswers += "Correct";
                    }
                    else {
                        guessAnswers += "Incorrect";
                    }

                    guessAnswers += ")\n";

                    /*
                    if (guesses === item.worstMeasureNumber) {
                        guessCorrect = true;
                        correctPartNames = correctPartNames + "\n" + item.partName;
                    }
                    else {
                        incorrectPartNames = incorrectPartNames + "\n" + item.partName;
                    } */
                }
		    }

		    if (i > 1) {
		    	dashboard("#dashboardholder", namesAndScores, true, false, false);
			}

            moveToTable();

            //This shouldn't be turned on yet, but it is available.
            //displayWholeXml(fileName);

            if (turnOnValidation) {
                alert(validationResults.noteOutput);
                alert(validationResults.intervalOutput);
            }

            /* Output from guesses. */
            if (guessCheck !== undefined) {
                alert(guessAnswers);
                /*
                if (guessCorrect) {
                    alert("You got it right! The following parts' most difficult measure is number "
                        + guesses + ":" + correctPartNames);
                }
                else {
                    alert("Sorry, that is incorrect. The following parts had a different measure "
                        + "as their most difficult one:" + incorrectPartNames);
                } */
            }
		},
		error : function(something) {
			alert("There was a problem. Please try again or contact the Music Scoring team.");
		}
	});
});

$(document).on('click', '#PDFVersion', function () {
	var fileName = "MusicPDFs/" + getRealMusicPieceName() + ".pdf";
	window.open(fileName, '_blank');
});

$(document).on('click', '#retrievedData tbody tr', function () {
	clickedRow = $(this);
    var toPass = complexityOutput.filter(function(s) {
        return s.partName == clickedRow[0].children[0].textContent;
    })[0];

    var timeToMove = 1000;
    if (!histoExists && pieExists) {
        timeToMove = 0;
    }
    createPieChartAndLegend(toPass, timeToMove);
} );

$(document).on('click', ".musicpiece", function() {
    // remove classes from all
    $(".musicpiece").removeClass("active");
    // add class to the one we clicked
    $(this).addClass("active");
    updateMusicListener();
});

function openGamePDF() {
    var frame = $("#pieceFramePDF");

    if (frame.length > 0) {
        var url = "MusicPDFs/" + getRealMusicPieceName() + ".pdf";
        var site = url+'?toolbar=0&amp;navpanes=0&amp;scrollbar=0';
        frame.src = site;
        frame[0].src = site;
    }
}

function setupGuesses() {
    var guessHolder = $("#worstMeasureGuesses");

    if (guessHolder.length > 0) {
        //inputBoxGuessInterface();
        removeDag();
        d3GuessInterface();
    }
}

function inputBoxGuessInterface() {
    var guessHolder = $("#worstMeasureGuesses");
    var htmlName = getActiveMusicPiece();
    var parts = samplePieces.filter(function(s) {
        return s.fancyName == htmlName;
    })[0].parts;


    var elementsToAdd = "";
    var i = 0;
    for (; i < parts.length; i++) {
        elementsToAdd += '<div class="row">';

        elementsToAdd += '<div class="col-md-4">';
        elementsToAdd += '<div class="well well-sm">';
        elementsToAdd += parts[i];    
        elementsToAdd += '</div>';
        elementsToAdd += '</div>';

        elementsToAdd += '<div class="col-md-8">';
        elementsToAdd += '<input type="number" class="form-control" ';
        elementsToAdd += 'placeholder="Input the number of the most complex measure for this part." ';
        elementsToAdd += 'min="0">';
        elementsToAdd += '</div>';

        elementsToAdd += '</div>';
    }

    guessHolder.html(elementsToAdd);
}

function d3GuessInterface() {
    var guessHolder = $("#worstMeasureGuesses");
    var htmlName = getActiveMusicPiece();
    var parts = samplePieces.filter(function(s) {
        return s.fancyName == htmlName;
    })[0].parts;

    /*var inputElem = '<input type="number" id="hiddenInputElem" class="form-control" ';
    inputElem += 'placeholder="Input the number of the most complex measure for this part." ';
    inputElem += 'min="0">';
    guessHolder.append(inputElem)
    $("#hiddenInputElem").hide();*/

    /* Set the diagrams Height & Width */
        var h = 550, w = 600;
    /* Set the color scale we want to use */
        var color = d3.scale.category20();
    /* Establish/instantiate an SVG container object */
        var svg = d3.select("#worstMeasureGuesses")
                        .append("svg")
                        .attr("height",h)
                        .attr("width",w);
    /* Build the directional arrows for the links/edges */
            svg.append("svg:defs")
                        .selectAll("marker")
                        .data(["end"]) 
                        .enter().append("svg:marker")
                        .attr("id", String)
                        .attr("viewBox", "0 -5 10 10")
                        .attr("refX", 15)
                        .attr("refY", -1.5)
                        .attr("markerWidth", 6)
                        .attr("markerHeight", 6)
                        .attr("orient", "auto")
                        .append("svg:path")
                        .attr("d", "M0,-5L10,0L0,5");
    /* Pre-Load the json data using the queue library */
    /*queue()
        .defer(d3.json, "nodes.json")
        .defer(d3.json, "links.json")
        .await(createGuessDiag); */

    var nodes = [parts.length + 1];
    var links = [parts.length];
    guesses = [parts.length];

    var initialNode = {};
    initialNode.name = htmlName;
    var n = 0;
    nodes[n] = initialNode;

    for (; n < parts.length; n++) {
        var node = {};
        node.name = parts[n];
        nodes[n + 1] = node;

        var link = {};
        link.source = 0;
        link.target = n + 1;
        links[n] = link;

        guesses[n] = -1;
    }

    dagExists = true;
    oldGuessIndex = -1;
    createGuessDiag(null, nodes, links, null);

    /* Define the main worker or execution function */
    function createGuessDiag(error, nodes, links, table) {
        /* Draw the node labels first */
       var texts = svg.selectAll("text")
                        .data(nodes)
                        .enter()
                        .append("text")
                        .attr("fill", "black")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "16px")
                        .text(function(d) { return d.name; }); 
        /* Establish the dynamic force behavor of the nodes */
        var force = d3.layout.force()
                        .nodes(nodes)
                        .links(links)
                        .size([w,h])
                        .linkDistance([250])
                        .charge([-1500])
                        .gravity(0.3)
                        .start();
        /* Draw the edges/links between the nodes */
        var edges = svg.selectAll("line")
                        .data(links)
                        .enter()
                        .append("line")
                        .style("stroke", "#ccc")
                        .style("stroke-width", 1)
                        .attr("marker-end", "url(#end)");
        /* Draw the nodes themselves */
        var firstOneBig = 0;                
        var nodes = svg.selectAll("circle")
                        .data(nodes)
                        .enter()
                        .append("circle")
                        .attr("r", 20)
                        .attr("opacity", 0.5)
                        .on("click",clicked)
                        .style("fill", function(d,i) { return color(i); })
                        .call(force.drag);
        /* Run the Force effect */
        force.on("tick", function() {
                   edges.attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });
                   nodes.attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; })
                   texts.attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                            });
                   }); // End tick func

        function clicked(d) {
            var index = d.index - 1;
            if (index != -1) {
                //guesses[index] = 38;
                tempVariableHolder = d;

                //var guessHolder = $("#worstMeasureGuesses");
                var hiddenInputElem = $("#hiddenInputElem")[0];

                //Check and store existing value
                if (oldGuessIndex != -1) {
                    if (hiddenInputElem.value === "") {
                        guesses[oldGuessIndex] = -1;
                    }
                    else {
                        guesses[oldGuessIndex] = parseInt(hiddenInputElem.value, 10);
                    } 
                }

                //Set new value
                if (guesses[index] == -1) {
                    hiddenInputElem.value = "";
                }
                else {
                    hiddenInputElem.value = guesses[index];
                }
                //hiddenInputElem.show();

                oldGuessIndex = index;
            }
        }
    }; // End makeDiag worker func
}

function removeDag() {
    if (dagExists) {
        d3.select("#worstMeasureGuesses").select("svg").remove();
        //$("#histoTitle").addClass('hidden');
        dagExists = false;
    }
}


function createPieChartAndLegend(complexityPart, movementTiming) {

    var noteVal = Math.floor(complexityPart.noteTotal);
    var intervalVal = Math.floor(complexityPart.intervalTotal);
    var pieparts = [{type:"Notes",total:noteVal}, {type:"Intervals",total:intervalVal}];
    var title = "Detailed Info About the " + complexityPart.partName + " Part";
    var worstMeasureTitle = "Most Complex Measure: #" + complexityPart.worstMeasureNumber;

    removePieAndLegend();

    try {
        setNotationCanvas(complexityPart.worstMeasureText);
    }
    catch(e) {
        $("#canvasErrorMessage").removeClass('hidden');
    }

    $("#worstMeasureTitle").text(worstMeasureTitle);
    $("#worstMeasureTitle").removeClass('hidden');
    $("#detailedInfoTitle").text(title);
    $("#detailedInfoTitle").removeClass('hidden');

    dashboard("#pieholder", pieparts, false, true, true, "#legendholder");

    moveToPie(movementTiming);
}

function setupPieceDropdown() {
    var elementsToAdd = "";
    var i = 0;
    for (; i < samplePieces.length; i++) {
        elementsToAdd += '<li role="presentation" class="musicpiece';
        if (i == 0) {
            elementsToAdd += ' active';
        }
        elementsToAdd += '"><a role="menuitem" tabindex="-1">';
        elementsToAdd += samplePieces[i].fancyName;
        elementsToAdd += '</a></li>';
    }

    $('#pieceDropdownHolder').html(elementsToAdd);
}

$(function() {
    $(".musicdifficulty").click(function() {
        // remove classes from all
        $(".musicdifficulty").removeClass("active");
        // add class to the one we clicked
        $(this).addClass("active");
        updateDifficultyListener();
    });
});

function moveToTable() {
    //$("body").scrollTop($("#retrievedData").offset().top);
    var distance = $("#retrievedData").offset().top - $("#navholder .container").height();
    $('html, body').animate({ scrollTop: distance }, 1000);
}

function moveToPie(amountOfTimeToMove) {
    if (amountOfTimeToMove === undefined) {
        amountOfTimeToMove = 1000;
    }
    //$("body").scrollTop($("#retrievedData").offset().top);
    var distance = $("#pieholder").offset().top - $("#navholder .container").height();
    $('html, body').animate({ scrollTop: distance }, amountOfTimeToMove);
}

function updateMusicListener() {
	$("#selectedholder").text(getActiveMusicPiece());
    openGamePDF();
    setupGuesses();				
}

function getActiveMusicPiece() {
	return $(".musicpiece.active").children()[0].text;
}

function updateDifficultyListener() {
    $("#difficultyholder").text(getActiveDifficulty());               
}

function getActiveDifficulty() {
    return $(".musicdifficulty.active").children()[0].text;
}

function getRealMusicPieceName() {
	var htmlName = getActiveMusicPiece();
	var toReturn = samplePieces.filter(function(s) {
        return s.fancyName == htmlName;
    })[0].fileNameNoExt;

	return toReturn;
}

function getRealDifficulty() {
    var htmlName = getActiveDifficulty();
    var toReturn = 1;
    switch(htmlName) {
        case 'Beginner' :
            toReturn = 1;
            break;
        case 'Novice' :
            toReturn = 2;
            break;
        case 'Intermediate' :
            toReturn = 3;
            break;
        case 'Advanced' :
            toReturn = 4;
            break;
        case 'Professional' :
            toReturn = 5;
            break;
        default :
            toReturn = 1;
            break;
    }

    return toReturn;
}

function isValidationOn() {
    return $('#validationCheckbox')[0].checked;
}

function getAColor() {
	var colors = ["#4B0082", "#0000CD", "#008000", "#FFFF00", "#FFA500", "#FF0000", "#808080"];
	return colors[colorCounter++ % colors.length];
}

function dashboard(id, fData, histo, pie, legendBool, legendId){
    var barColor = 'steelblue';

    var namesAndColors = {Notes:getAColor(), Intervals:getAColor()};
    //function segColor(c){ return {Notes:"#807dba", Intervals:"#e08214",high:"#41ab5d"}[c]; }
    function matchColor(name){ return namesAndColors[name]; }
    
    // compute total for each state.
    //fData.forEach(function(d){d.total=d.freq.low+d.freq.mid+d.freq.high;});
    
    // function to handle histogram.
    function histoGram(fD){
        var hG={},    hGDim = {t: 60, r: 0, b: 80, l: 0};
        hGDim.w = 800 - hGDim.l - hGDim.r, 
        hGDim.h = 500 - hGDim.t - hGDim.b;
            
        //create svg for histogram.
        var hGsvg = d3.select(id).append("svg")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
            .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

        // create function for x-axis mapping.
        var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
                .domain(fD.map(function(d) { return d[0]; }));

        // Add x-axis to the histogram svg.
        hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"));

        // Create function for y-axis map.
        var y = d3.scale.linear().range([hGDim.h, 0])
                .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                .append("g").attr("class", "bar");
        
        //create the rectangles.
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.rangeBand())
            .attr("height", function(d) { return hGDim.h - y(d[1]); })
            .attr('fill',getAColor())
            .on("click",clicked); // click is defined below.
            //.on("mouseover",mouseover)// mouseover is defined below.
            //.on("mouseout",mouseout);// mouseout is defined below.
            

        //Create the slanted x text
        hGsvg.attr("class", "x axis")
        	.selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)" 
            });

        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "middle");


        function clicked(d){  // utility function to be called on click of a bar.
            // filter for selected state.
            //tempVariableHolder = d;

            var selected = complexityOutput.filter(function(s){ return s.partName == d[0]; })[0];
            if (selected === undefined) {
                return;
            }
               
            // call update functions of pie-chart and legend. 
            var timeToMove = 0;
            if (!pieExists) {
                timeToMove = 1000;
            }   
            createPieChartAndLegend(selected, timeToMove);
        }
        
        /*
        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected state.
            var st = fData.filter(function(s){ return s.State == d[0];})[0],
                nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
               
            // call update functions of pie-chart and legend.    
            pC.update(nD);
            leg.update(nD);
        }
        
        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.    
            pC.update(tF);
            leg.update(tF);
        }
        
        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in frequencies.
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);
            
            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(nD);
            
            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGDim.h - y(d[1]); })
                .attr("fill", color);

            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });            
        }    
        */    
        $("#histoTitle").removeClass('hidden');
        histoExists = true;
        return hG;
    }
    
    
    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieDim ={w:250, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
                
        // create svg for pie chart.
        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");
        
        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.total; });

        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) {
            	//var tempCol = getAColor();
            	//namesAndColors[d.type] = tempCol;
            	//return tempCol;
            	//tempVariableHolder = d;
            	//alert("hold");
            	return matchColor(d.data.type);
            });
            //.on("mouseover",mouseover).on("mouseout",mouseout);

        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }   

        /*     
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(fData.map(function(v){ 
                return [v.State,v.freq[d.data.type]];}),segColor(d.data.type));
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hG.update(fData.map(function(v){
                return [v.State,v.total];}), barColor);
        }
		*/

        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }    

        pieExists = true;
        return pC;
    }
    
    // function to handle legend.
    function legend(lD){
        var leg = {};
        var stopForNan = false;
            
        // create table for legend.
        var legend = d3.select(legendId).append("table").attr('class','legend');
        
        // create one row per segment.
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");
            
        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
			.attr("fill",function(d){ return matchColor(d.type); });
            
        // create the second column for each segment.
        tr.append("td").text(function(d){ return d.type;});

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            .text(function(d){ return d3.format(",")(d.total);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return d3.format(",")(d.total);});

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});        
        }
        
        function getLegend(d,aD){ // Utility function to compute percentage.
        	var percentage = d.total/d3.sum(aD.map(function(v){ return v.total; }));
        	if (isNaN(percentage)) {
        		percentage = 0;
        		stopForNan = true;
        	}
            return d3.format("%")(percentage);
        }
        //alert(namesAndColors);
        legendExists = true;
        if (stopForNan) {
            removePieAndLegend();
        }
        return leg;
    }
    
    /*
    // calculate total frequency by segment for all state.
    var tF = ['low','mid','high'].map(function(d){ 
        return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))}; 
    });    
    */

    var pF = fData.map(function(d){return [d.type,d.total];});
    
    // calculate total frequency by state for all segment.
    var sF = fData.map(function(d){return [d.partName,d.total];});

    if (histo) {
    	var hG = histoGram(sF); // create the histogram.
	}
	if (pie) {
    	var pC = pieChart(fData); // create the pie-chart.
    }
    if (legendBool) {
    	var leg = legend(fData);  // create the legend.
	}
}

function setNotationCanvas(worstMeasure) {
    //$('#notationholder').html()
    
    var elem = $('#notationcanvas');
    var canvas = elem[0];
    /*var renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);

    var ctx = renderer.getContext();

    var stave = new Vex.Flow.Stave(10, 0, 500);
    stave.addClef("treble").setContext(ctx).draw();*/


    var doc = new Vex.Flow.Document(worstMeasure);
    formatter = doc.getFormatter();
    formatter.setWidth(600).draw(canvas);

    var newCanvas = $("#notationcanvas canvas");
    if (newCanvas[0].width > 600) {
        newCanvas.css("width", "600px");
    }
    else if (newCanvas[0].width < 200) {
        newCanvas.css("width", "200px");
    }
    elem.removeClass('hidden');
}

/*
    Code to display an entire music xml file in the page. Experimental.
 */
function displayWholeXml(xmlName) {
    var fileName = xmlName;
    if (xmlName === undefined) {
        fileName = "MusicXMLs/" + getRealMusicPieceName() + ".xml";
    }
    //Need some code here to execute the jar file with the specified parameters.
    $.ajax({
        type : "GET",
        url : fileName,
        success : function(results) {
            //tempVariableHolder = results;
            var doc = new Vex.Flow.Document(results);
            formatter = doc.getFormatter();
            formatter.setWidth(800).draw($("#xmlholder")[0]);
        },
        error : function(something) {
            alert("There was a problem. Please try again or contact the Music Scoring team.");
        }
    });
}

function removePieAndLegend() {
    if (pieExists) {
        d3.select("#pieholder").select("svg").remove();
        pieExists = false;
    }
    if (legendExists) {
        d3.select("#legendholder").select("table").remove();
        legendExists = false;
    }

    $("#detailedInfoTitle").addClass('hidden');
    $("#worstMeasureTitle").addClass('hidden');
    $("#canvasErrorMessage").addClass('hidden');
    $("#notationcanvas").addClass('hidden');
}

function removeHisto() {
    if (histoExists) {
        d3.select("#dashboardholder").select("svg").remove();
        $("#histoTitle").addClass('hidden');
        histoExists = false;
    }
}


