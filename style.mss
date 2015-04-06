/*
Tilemill style for opentrees.org
Made by Steve Bennett (stevage@gmail.com, @stevage1, stevebennett.me)
Licensed as CC-BY AU 3.0
*/
@water:hsl(220,40%,80%);
Map {
  background-color: @water;
}

#landpolygon {
  line-width:0;
//  line-color:white;
  polygon-fill:#eee;

}

#trees::polygon[zoom >= 17] {
  polygon-fill:green;
  polygon-opacity:0.5;
  line-color:green;
  line-width:0.5;
}

#trees{
  marker-line-width:1.5;
  marker-width:1;
  [zoom = 13] { marker-width:2; }
  [zoom = 14] { marker-width:3;}
  [zoom = 15] { marker-width: 4; marker-line-width: 3; }  
  [zoom = 16] { marker-width: 6; marker-line-width: 4; }  
  [zoom = 17] { marker-width: 8; marker-line-width: 5; }  
  [zoom = 18] { marker-width: 10; marker-line-width: 6; }  
  [zoom = 19] { marker-width: 12; marker-line-width: 7; }  
  [zoom >= 20] { marker-width: 14; marker-line-width: 8; }  
  marker-fill:hsl(110,80%, 30%);
  marker-line-color:hsl(110,80%, 70%);
  [zoom <= 12] { marker-line-opacity: 0.1; }
  [zoom = 13] { marker-line-opacity:0.2; }
  [zoom = 14] { marker-line-opacity:0.35; }
  [zoom >= 15] { marker-line-opacity:0.5; }
  marker-allow-overlap:true;
  marker-ignore-placement:true;
  #trees[species=''] {
    marker-line-color:hsl(120,60%,60%);
    marker-fill:      hsl(120,60%,40%);
  }

  #trees[genus=''] {
    marker-line-color:hsl(130,30%,60%);
    marker-fill:      hsl(130,30%,40%);
  }
  #trees[health='Dead'], #trees[description='Stump'] {
    marker-line-color:darkgray;
    marker-fill:black;
  }
}


#roads[highway != 'residential'],
#roads[zoom >= 14] {
  line-color:lightgrey;
  line-width:0.5;
}

#roads[highway = 'motorway'] {
  line-color:grey;
}

#paths[zoom >= 14] {
  line-width:0.5;
  line-color:hsl(220,30%,60%);
  line-dasharray: 2,2;
}


#parks {
  line-width:0;
  polygon-opacity:0.2;
  polygon-fill:hsl(100,60%,60%);
}


#water {
  line-width:0.0;
  polygon-opacity:0.5;
  polygon-fill:@water;
}


#rivers[waterway='river'],
#rivers[zoom >= 11]{
  line-width:1;
  line-opacity:0.5;
  line-color:@water;
}

#places[place='city'][zoom >= 12],
#places[place='town'][zoom >= 12],
#places[place='village'][zoom >= 13],
#places[place='suburb'][zoom >= 14]{
  text-name:[name];
  text-face-name:'Roboto Condensed Light Italic';
  text-transform:capitalize;
  text-size: 32;
  [zoom <= 9] { text-size: 24; }
  [zoom >= 11] { text-size: 24; }
  text-fill: grey;
  text-allow-overlap:true;
  text-opacity:0.5;
  [zoom = 14] { text-opacity:0.4; }
  [zoom = 15] { text-size: 48; text-opacity: 0.3;}
  [zoom >= 16] { text-size: 64; text-opacity: 0.1;}
}


#lga-boundaries[zoom <= 11] {
  text-name:[LGA_NAME11];
  text-face-name:'Roboto Condensed Light';
  text-size: 14;
  text-fill: grey;
  text-allow-overlap:true;
  text-opacity:0.8;
  [zoom >= 11] { text-opacity:0.5; }
  text-halo-fill:#eee;
  text-halo-radius:1;
  text-wrap-width:50;
  text-wrap-before:true;
  text-placement:interior;
  line-color:hsl(30,10%,60%);
  line-width:0.5;
  line-opacity:0.5;

}

#waite {
  line-color:hsl(110,50%,10%);
  line-width:0.5;
  polygon-opacity:1;
  polygon-fill:hsl(110,50%,40%);
}

