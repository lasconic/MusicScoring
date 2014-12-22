import java.io.File;
import java.io.IOException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;


public class Parser {
	private File xmlToParse;
	private static final String SCORE_NODE = "score-partwise";
	private static final String PART_NODE = "part";
	private static final int SCORE_REQUIRED = 2;
	//private static final String MEASURE_NODE = "measure";
	//private static final String NOTE_NODE = "note";
	private NodeList measures;
	
	public Parser(File xmlFile) {
		measures = null;
		start(xmlFile);
	}
	
	public void setXmlFile(File xmlFile) {
		xmlToParse = xmlFile;
	}

	public void start(File xmlFile) {
		setXmlFile(xmlFile);
		start();
		//parseMeasures();
	}
	
	public void start() {
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
		int scoreCount = 0;
		
		for (int i = 0; i < list.getLength(); i++) {
			if (scoreCount == SCORE_REQUIRED) {
				break;
			}
			elem = list.item(i);
			String name = elem.getNodeName().trim();
			if (name.equalsIgnoreCase(SCORE_NODE)) {
				scoreCount++;
			}
		}
		
		if (elem == null || scoreCount != SCORE_REQUIRED) {
			System.out.println("ERROR: Couldn't find the score in the xml.");
			return;
		}
		list = elem.getChildNodes();
		elem = null;
		
		for (int i = 0; i < list.getLength(); i++) {
			elem = list.item(i);
			String name = elem.getNodeName().trim();
			if (name.equalsIgnoreCase(PART_NODE)) {
				break;
			}
		}
		
		if (elem == null || !elem.getNodeName().trim().equalsIgnoreCase(PART_NODE)) {
			System.out.println("ERROR: Couldn't find the first part in the xml.");
			return;
		}
		measures = elem.getChildNodes();
		return;
	}
	
	public boolean parseMeasures() {
		if (measures == null) {
			System.out.println("ERROR: No measures to parse in the xml.");
			return false;
		}
		
		System.out.println("Found some measures.");
		return false;
	}
}
