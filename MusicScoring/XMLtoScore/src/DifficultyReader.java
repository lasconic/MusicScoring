import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import MusicalElements.Dynamic;
import MusicalElements.Interval;
import Utilities.Utils;


public class DifficultyReader {
	private File xmlToParse;
	
	private static final String LEVELS_NAME = "levels";
	private static final String INTERVAL_NAME = "interval";
	//private static final String RANGE_NAME = "range";
	private static final String NOTES_NAME = "notes";
	private static final String DASH = "-";
	
	private static final int DEFAULT_NOTE_DIFFICULTY = 1;
	private static final int DEFAULT_INTERVAL_DIFFICULTY = 10;
	private static final double DEFAULT_DYNAMIC_DIFFICULTY = 1.5;
	
	/*private int interval;
	private int range;*/
	private HashMap<Integer, Integer> individualNotes;
	private List<Interval> intervalDifficulties;
	private HashMap<Dynamic, Double> dynamicDifficulties;
	
	private static final boolean TRUE_FOR_SAX_FALSE_FOR_CLARINET = false;
	
	public DifficultyReader(File xmlFile) {
		/*interval = -1;
		range = -1;*/
		individualNotes = new HashMap<Integer, Integer>();
		//intervalDifficulties = new ArrayList<Interval>();
		//dynamicDifficulties = new HashMap<dynamic, Double>();
		setDefaultNotes();
		setDefaultIntervals();
		setDefaultDynamics();
		setXmlFile(xmlFile);
		start();
	}
	
	private void setXmlFile(File xmlFile) {
		xmlToParse = xmlFile;
	}
	
	private void start() {
		DocumentBuilder builder;
		Document toRead;
		NodeList list;
		try {
			builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
			toRead = builder.parse(xmlToParse);
		} catch (ParserConfigurationException | SAXException | IOException e) {
			System.out.println("ERROR: Couldn't open the xml file to read. Possibly an incorrect name.");
			e.printStackTrace();
			return;
		}
		
		list = toRead.getChildNodes();		
		Node elem = null;
		
		for (int i = 0; i < list.getLength(); i++) {
			elem = list.item(i);
			
			String name = elem.getNodeName().trim();
			if (name.equalsIgnoreCase(LEVELS_NAME)) {
				break;
			}
		}
		
		if (elem == null || !LEVELS_NAME.equalsIgnoreCase(elem.getNodeName().trim())) {
			return;
		}
		list = elem.getChildNodes();
		elem = null;

		for (int i = 0; i < list.getLength(); i++) {
			elem = list.item(i);
			
			String name = elem.getNodeName().trim().toLowerCase();

			switch(name) {
			case INTERVAL_NAME:
				setDefaultIntervals();			
				break;
			/*case RANGE_NAME:
				try {
					range = Integer.parseInt(elem.getTextContent());
				} catch (NumberFormatException e) {
					range = -1;
				}
				break;*/
			case NOTES_NAME:
				//parseNoteDifficulty(elem.getChildNodes());
				break;
			}
		}
	}
	
	@SuppressWarnings("unused")
	private void parseNoteDifficulty(NodeList notes) {		
		if (notes == null || notes.getLength() == 0) {
			return;
		}
		
		Node elem = null;
		for (int i = 0; i < notes.getLength(); i++) {
			elem = notes.item(i);
			if (elem == null) { continue; }
			
			String note = elem.getNodeName().trim().toLowerCase();
			String value = elem.getTextContent().trim().toLowerCase();
			int diff = 1;
			try {
				diff = Integer.parseInt(value);
			} catch (NumberFormatException e) {
				System.out.println("ERROR: Note difficulty unreadable.");
			}
			
			int index = note.indexOf(DASH);
			if (index != -1) {
				int firstNote = Utils.noteToNum(note.substring(0, index));
				int secondNote = Utils.noteToNum(note.substring(index + 1));
				for (int j = firstNote; j <= secondNote; j++) {
					individualNotes.put(j, diff);
				}
			}
			else {
				int noteNum = Utils.noteToNum(note);
				individualNotes.put(noteNum, diff);
			}
			
		}
	}

	/*public int getIntervalDifficulty() {
		return interval;
	}

	public int getRangeDifficulty() {
		return range;
	}*/
	
	public int getNoteDifficulty(int noteNum) {
		Integer output = individualNotes.get(noteNum);
		if (output == null) {
			return DEFAULT_NOTE_DIFFICULTY;
		}
		else {
			return output.intValue();
		}
	}

	public int getIntervalDifficulty(int note1, int note2, int key) {
		for(Interval inter : intervalDifficulties) {
			if (inter.matches(note1, note2, key)) {
				return inter.getDifficulty();
			}
		}
		
		return DEFAULT_INTERVAL_DIFFICULTY;
	}
	
	public double getDynamicDifficulty(Dynamic dynam) {
		Double output = dynamicDifficulties.get(dynam);
		if (output == null) {
			return DEFAULT_DYNAMIC_DIFFICULTY;
		}
		else {
			return output.doubleValue();
		}
	}

	public double getTempoDifficulty(double duration, int notes) {
		return (double)notes / duration;
	}

	private boolean setDefaultNotes() {
		individualNotes = new HashMap<Integer, Integer>();
		
		if (TRUE_FOR_SAX_FALSE_FOR_CLARINET) {
			int i;
			int bflat3 = Utils.noteToNum("B", "3", "-1");
			int csharp3 = Utils.noteToNum("C", "3", "1");
			for (i = bflat3; i <= csharp3; i++) {
				individualNotes.put(i, 10);
			}
			
			int d3 = Utils.noteToNum("D", "3", "0");
			int fsharp3 = Utils.noteToNum("F", "3", "1");
			for (i = d3; i <= fsharp3; i++) {
				individualNotes.put(i, 8);
			}
			
			int g3 = Utils.noteToNum("G", "3", "0");
			int csharp4 = Utils.noteToNum("C", "4", "1");
			for (i = g3; i <= csharp4; i++) {
				individualNotes.put(i, 1);
			}			
			
			int d4 = Utils.noteToNum("D", "4", "0");
			int g4 = Utils.noteToNum("G", "4", "0");
			for (i = d4; i <= g4; i++) {
				individualNotes.put(i, 6);
			}
			
			int gsharp4 = Utils.noteToNum("G", "4", "1");
			int csharp5 = Utils.noteToNum("C", "5", "1");
			for (i = gsharp4; i <= csharp5; i++) {
				individualNotes.put(i, 8);
			}			
			
			int d5 = Utils.noteToNum("D", "5", "0");
			int fsharp5 = Utils.noteToNum("F", "5", "1");
			for (i = d5; i <= fsharp5; i++) {
				individualNotes.put(i, 10);
			}			
		}
		else {
			int g3 = Utils.noteToNum("G", "3", "0");
			int g4 = Utils.noteToNum("G", "4", "0");
			for (int i = g3; i <= g4; i++) {
				individualNotes.put(i, 1);
			}
			
			int a4 = Utils.noteToNum("A", "4", "0");
			individualNotes.put(a4, 2);
			
			int b4 = Utils.noteToNum("B", "4", "0");
			int c5 = Utils.noteToNum("C", "5", "0");
			for (int j = b4; j <= c5; j++) {
				individualNotes.put(j, 5);
			}
			
			int csharp5 = Utils.noteToNum("C", "5", "1");
			int high = 10000;
			for (int k = csharp5; k <= high; k++) {
				individualNotes.put(k, 10);
			}
		}		
		
		return true;
	}
	
	private void setDefaultIntervals() {
		if (TRUE_FOR_SAX_FALSE_FOR_CLARINET) {
			Interval unisons = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, 1, 1);
			int bflat3 = Utils.noteToNum("B", "3", "-1");
			int dflat3 = Utils.noteToNum("D", "3", "-1");
			Interval superLowSeconds = new Interval(bflat3, dflat3, bflat3, dflat3, 2, 5);
			Interval superLowThirds = new Interval(bflat3, dflat3, bflat3, dflat3, 3, 5);
			int d3 = Utils.noteToNum("D", "3", "0");
			int fsharp3 = Utils.noteToNum("F", "3", "1");
			Interval lowSeconds = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, d3, fsharp3, 2, 3);	
			Interval lowThirds = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, d3, fsharp3, 3, 3);		
			int g3 = Utils.noteToNum("G", "3", "0");
			int csharp4 = Utils.noteToNum("C", "4", "1");
			Interval seconds = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, g3, csharp4, 2, 1);
			Interval thirds = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, g3, csharp4, 3, 1);
			Interval fourths = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, g3, csharp4, 4, 1);			
			int d4 = Utils.noteToNum("D", "4", "0");
			int g4 = Utils.noteToNum("G", "4", "0");
			Interval highSeconds = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, d4, g4, 2, 5);
			Interval highThirds = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, d4, g4, 3, 5);
			Interval highFourths = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, d4, g4, 4, 5);
			Interval highFifths = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, d4, g4, 5, 5);			
			int gsharp4 = Utils.noteToNum("G", "4", "1");
			int csharp5 = Utils.noteToNum("C", "5", "1");
			Interval highs = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, gsharp4, csharp5, Interval.ANY_INTERVAL, 8);			
			int d5 = Utils.noteToNum("D", "5", "0");
			Interval superHighs = new Interval(d5, Interval.ANY_NOTE, d5, Interval.ANY_NOTE, Interval.ANY_INTERVAL, 10);
			Interval sixths = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, 6, 9);
			Interval sevenths = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, 7, 9);
			Interval octaves = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, 8, 9);
			Interval larges = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, -8, 10);
			intervalDifficulties = new ArrayList<Interval>();
			intervalDifficulties.add(unisons);
			intervalDifficulties.add(superLowSeconds);
			intervalDifficulties.add(superLowThirds);
			intervalDifficulties.add(lowSeconds);
			intervalDifficulties.add(lowThirds);
			intervalDifficulties.add(seconds);
			intervalDifficulties.add(thirds);
			intervalDifficulties.add(fourths);
			intervalDifficulties.add(highSeconds);
			intervalDifficulties.add(highThirds);
			intervalDifficulties.add(highFourths);
			intervalDifficulties.add(highFifths);
			intervalDifficulties.add(highs);			
			intervalDifficulties.add(superHighs);
			intervalDifficulties.add(sixths);
			intervalDifficulties.add(sevenths);
			intervalDifficulties.add(octaves);
			intervalDifficulties.add(larges);
		}
		else {
			Interval unisons = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, 1, 1);
			int g3 = Utils.noteToNum("G", "3", "0");
			int g4 = Utils.noteToNum("G", "4", "0");
			Interval seconds = new Interval(g3, g4, g3, g4, 2, 2);
			Interval thirds = new Interval(g3, g4, g3, g4, 3, 3);
			Interval fourths = new Interval(g3, g4, g3, g4, 4, 4);
			Interval fifths = new Interval(g3, g4, g3, g4, 5, 5);
			int b4 = Utils.noteToNum("B", "4", "0");
			int c5 = Utils.noteToNum("C", "5", "0");
			Interval jumps = new Interval(g3, g4, b4, c5, Interval.ANY_INTERVAL, 8);
			int csharp5 = Utils.noteToNum("C", "5", "1");
			Interval highs = new Interval(b4, c5, csharp5, Interval.ANY_NOTE, Interval.ANY_INTERVAL, 10);
			Interval sixths = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, 6, 9);
			Interval sevenths = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, 7, 9);
			Interval octaves = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, 8, 9);
			Interval larges = new Interval(Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, Interval.ANY_NOTE, -8, 10);
			intervalDifficulties = new ArrayList<Interval>();
			intervalDifficulties.add(unisons);
			intervalDifficulties.add(seconds);
			intervalDifficulties.add(thirds);
			intervalDifficulties.add(fourths);
			intervalDifficulties.add(fifths);
			intervalDifficulties.add(jumps);
			intervalDifficulties.add(highs);
			intervalDifficulties.add(sixths);
			intervalDifficulties.add(sevenths);
			intervalDifficulties.add(octaves);
			intervalDifficulties.add(larges);
		}
	}

	private void setDefaultDynamics() {
		dynamicDifficulties = new HashMap<Dynamic, Double>();
		dynamicDifficulties.put(Dynamic.MF, (double) 1);
		dynamicDifficulties.put(Dynamic.MP, (double) 1);
		dynamicDifficulties.put(Dynamic.F, 1.1);
		dynamicDifficulties.put(Dynamic.FF, 1.2);
		dynamicDifficulties.put(Dynamic.P, 1.3);
		dynamicDifficulties.put(Dynamic.PP, 1.5);
	}
}
