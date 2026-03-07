import requests
import xml.etree.ElementTree as ET

url = "https://portal.csdi.gov.hk/server/services/common/td_rcd_1638928986276_39755/MapServer/WFSServer?service=wfs&request=GetCapabilities"
try:
    response = requests.get(url)
    response.raise_for_status()
    
    # Check for XML content
    if response.headers.get('Content-Type', '').startswith('text/xml') or 'xml' in response.text[:100]:
        root = ET.fromstring(response.content)
        
        # XML Namespaces usually found in WFS
        namespaces = {
            'wfs': 'http://www.opengis.net/wfs/2.0',
            'ows': 'http://www.opengis.net/ows/1.1'
        }
        
        # Try to find FeatureTypeList
        # Try finding in WFS 2.0 namespace
        namespaces = {'wfs': 'http://www.opengis.net/wfs/2.0'}
        feature_types = root.findall('.//wfs:FeatureType', namespaces)
        
        if not feature_types:
            # Fallback for WFS 1.1.0 or 1.0.0 (often no namespace or different namespace structure)
            # Try searching without namespace or with a wildcard if lxml was used, but with standard ElementTree we need to be specific or iterate.
            # Let's try iterating all elements if the namespace fail
            print("Trying fallback search for FeatureType...")
            for elem in root.iter():
                if 'FeatureType' in elem.tag:
                    name_elem = None
                    title_elem = None
                    for child in elem:
                        if 'Name' in child.tag:
                            name_elem = child
                        if 'Title' in child.tag:
                            title_elem = child
                    
                    if name_elem is not None:
                         print(f"Name: {name_elem.text}")
                    if title_elem is not None:
                         print(f"Title: {title_elem.text}")
                    feature_types.append(elem) # Just to mark we found some

        if feature_types:
            # print(f"Found {len(feature_types)} feature types (or iterating found them).")
            layer_names = []
            for ft in feature_types:
                 name = ft.find('wfs:Name', namespaces)
                 if name is not None:
                     layer_names.append(name.text)
            
            import json
            print(json.dumps(layer_names, indent=4))
        else:
             print("No FeatureTypes found with standard namespaces.")

            
        print(f"Found {len(feature_types)} feature types.")
        for ft in feature_types:
            name = ft.find('wfs:Name', namespaces)
            title = ft.find('wfs:Title', namespaces)
            print(f"Name: {name.text if name is not None else 'N/A'}")
            print(f"Title: {title.text if title is not None else 'N/A'}")
            
    else:
        print("Response does not appear to be XML.")
        print(response.text[:200])

except Exception as e:
    print(f"Error: {e}")
