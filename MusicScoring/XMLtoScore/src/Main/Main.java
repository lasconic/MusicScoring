package Main;
import java.io.File;

import Clarinet.*;
import DifficultyLevels.DifficultyLevel;


public class Main {
	public static boolean LOGGING = false;
	
	/*private static final String FOLDER_NAME = System.getProperty("user.dir") + File.separator;
	private static final String DEFAULT_FILE_NAME =
			//"The_Hobbit_The_Desolation_of_Smaug_Medley_for_Solo_Clarinet.xml";
			//"level1.xml";
			"level2.xml";*/
	private static final DifficultyLevel DEFAULT_LEVEL = new Beginner();
	private static final String xmlEnding = ".xml";
	private static final String TURN_ON_LOGGING = "--logging=true";
	
	private static String fullFileName;
	private static int diffNum;

	public static void main(String[] args) {
		diffNum = 1;
		if (args.length == 0 || args[0] == null || args[0].isEmpty()) {
			outputError();
			return;
		}
		else {
			for (int i = 0; i < args.length; i++) {
				attemptSetXml(args[i]);
				attemptSetDifficulty(args[i]);
				attemptSetLogging(args[i]);
			}
		}
		
		DifficultyLevel lev = setDifficultyFromNum();
		File xmlFile;
		
		try {
			xmlFile = new File(fullFileName);
		}
		catch (NullPointerException e) {
			outputError();
			return;
		}
		
		if (LOGGING) {
			System.out.println("Logging enabled via command line. Now beginning parsing process.");
		}
		
		Scorer letsGetSomeOutput = new Scorer(lev, xmlFile);

		System.out.println("File: " + fullFileName);
		System.out.println("Score: " + letsGetSomeOutput.getSetScore());
		return;
		
	}
	
	private static void outputError() {
		System.out.println("ERROR: No input file specified. Now quitting.");
	}

	private static void attemptSetXml(String arg) {
		if (arg != null && !arg.isEmpty() && arg.toLowerCase().endsWith(xmlEnding) && fullFileName == null) {
			fullFileName = arg;
		}
	}
	
	private static void attemptSetDifficulty(String arg) {
		if (arg != null && !arg.isEmpty()) {
			try {
				diffNum = Integer.parseInt(arg);
			} catch (NumberFormatException e) {
				diffNum = 1;
			}
		}
	}

	private static void attemptSetLogging(String arg) {
		if (arg != null && !arg.isEmpty() && arg.equalsIgnoreCase(TURN_ON_LOGGING)) {
			LOGGING = true;
		}
	}

	private static DifficultyLevel setDifficultyFromNum() {
		DifficultyLevel lev;
		switch (diffNum) {
		case (1) :
			lev = new Beginner();
			break;
		case (2) :
			lev = new Novice();
			break;
		case (3) :
			lev = new Intermediate();
			break;
		case (4) :
			lev = new Advanced();
			break;
		case (5) :
			lev = new Professional();
			break;
		default :
			if (diffNum < 1) { lev = new Beginner(); }
			else if (diffNum > 5) { lev = new Professional(); }
			else { lev = DEFAULT_LEVEL; }
			break;
		}
		
		return lev;
	}
}
