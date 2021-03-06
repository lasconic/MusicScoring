package Main;
import java.io.File;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.json.simple.JSONValue;

import Visitors.*;
import DifficultyLevels.DifficultyLevel;
import Utilities.*;


public class Scorer {
	private File xml;
	//private ParserStarter parse;
	//private DifficultyLevel level;
	private NoteComplexityVisitor visitor;
	private double score;
	private List<ComplexityScore> allScoredParts;
	private String json;
	private boolean validation;
	private ValidationResults validationOutput;
	
	@SuppressWarnings("unchecked")
	public Scorer (DifficultyLevel aLevel, File xmlFile, boolean validate) {
		xml = xmlFile;
		validation = validate;
		validationOutput = null;
		
		if (validation) {
			DifficultyValidatorVisitor validator = new DifficultyValidatorVisitor(aLevel);
			validationOutput = validator.getResults();
		}
		
		//parse.statusReport();
		
		visitor = new NoteComplexityVisitor(xml, aLevel);
		allScoredParts = visitor.getAllScores();
		try {
			score = allScoredParts.get(0).getOverallScore();
		}
		catch (IndexOutOfBoundsException e) {
			score = 0.0;
		}
		
		/*
		//Portion for printing out all the scores gathered.
		for (int i = 0; i < visitor.getAmountOfScores(); i++) {
			System.out.println("Score Number " + i + " is: " + visitor.getScore(i));
		}*/
		
		/*if (Main.LOGGING) {
			visitor.statusReport();
		}*/

		@SuppressWarnings("rawtypes")
		List  l1 = new LinkedList();
		@SuppressWarnings("rawtypes")
		Map topMap = new LinkedHashMap();
		
		for (ComplexityScore score : allScoredParts) {
			@SuppressWarnings("rawtypes")
			Map m1 = new LinkedHashMap();
			m1.put("partName", score.getName());
			m1.put("overallScore", score.getOverallScore());
			m1.put("otherFieldsSet", score.getOtherFieldsSet());
			m1.put("worstMeasureNumber", score.getMostDifficultMeasureNumber());
			m1.put("worstMeasureValue", score.getMostDifficultMeasureValue());
			m1.put("worstMeasureText", score.getMostDifficultyMeasureText());
			m1.put("noteTotal", score.getTotalNoteScore());
			m1.put("intervalTotal", score.getTotalIntervalScore());
			l1.add(m1);
		}

		@SuppressWarnings("rawtypes")
		List validationList = new LinkedList();
		@SuppressWarnings("rawtypes")
		Map validationValues = new LinkedHashMap();
		
		if (validationOutput == null) {
			validationValues.put("noteOutput", Constants.VALIDATION_INITIAL_RESULT);
			validationValues.put("intervalOutput", Constants.VALIDATION_INITIAL_RESULT);
		}
		else {
			validationValues.put("noteOutput", validationOutput.getNoteResults());
			validationValues.put("intervalOutput", validationOutput.getIntervalResults());
		}
		
		validationList.add(validationValues);
		
		topMap.put("validationResults", validationList);
		topMap.put("scoreResults", l1);

		json = JSONValue.toJSONString(topMap);
		                
		//System.out.println(jsonString);
		
	}
	
	public double getSetScore() {
		return score;
	}
	
	public String getJsonString() {
		return json;
	}
	
	public ValidationResults getValidationResults() {
		return validationOutput;
	}
}
