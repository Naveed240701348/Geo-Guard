const { db } = require('../config/firebase');
const { generatePolygonFromCentroid } = require('../utils/generatePolygon');

const parcels = [
  { survey_no:'1/1A',   sub_division:'1A',  ulpin:'PALLAV001A', village_lgd_code:'627845', patta_no:'PTT-PA001', owner_name:'Arumugam Selvam',        area_acres:0.45,  district:'Chengalpattu', taluk:'Pallavaram', village:'Zamin Pallavaram',    land_type:'private',   status:'clear',      centroid_lat:12.9721, centroid_lng:80.1512 },
  { survey_no:'2/1B',   sub_division:'1B',  ulpin:'PALLAV002B', village_lgd_code:'627845', patta_no:'PTT-PA002', owner_name:'Kamala Devi',             area_acres:0.30,  district:'Chengalpattu', taluk:'Pallavaram', village:'Zamin Pallavaram',    land_type:'private',   status:'clear',      centroid_lat:12.9715, centroid_lng:80.1498 },
  { survey_no:'5/2A',   sub_division:'2A',  ulpin:'PALLAV005A', village_lgd_code:'627845', patta_no:'GOV-PA003', owner_name:'Tamil Nadu Government',   area_acres:2.10,  district:'Chengalpattu', taluk:'Pallavaram', village:'Zamin Pallavaram',    land_type:'government',status:'government', centroid_lat:12.9698, centroid_lng:80.1478 },
  { survey_no:'8/3B',   sub_division:'3B',  ulpin:'PALLAV008B', village_lgd_code:'627845', patta_no:'PTT-PA004', owner_name:'Suresh Kumar',            area_acres:0.55,  district:'Chengalpattu', taluk:'Pallavaram', village:'Zamin Pallavaram',    land_type:'private',   status:'encroached', centroid_lat:12.9732, centroid_lng:80.1534 },
  { survey_no:'12/1A',  sub_division:'1A',  ulpin:'PALLAV012A', village_lgd_code:'627845', patta_no:'PTT-PA005', owner_name:'Meena Krishnan',          area_acres:0.75,  district:'Chengalpattu', taluk:'Pallavaram', village:'Zamin Pallavaram',    land_type:'private',   status:'clear',      centroid_lat:12.9710, centroid_lng:80.1455 },
  { survey_no:'15/4C',  sub_division:'4C',  ulpin:'PALLAV015C', village_lgd_code:'627845', patta_no:'POR-PA006', owner_name:'Tamil Nadu Government',   area_acres:3.20,  district:'Chengalpattu', taluk:'Pallavaram', village:'Zamin Pallavaram',    land_type:'poramboke', status:'government', centroid_lat:12.9745, centroid_lng:80.1520 },
  { survey_no:'18/2B',  sub_division:'2B',  ulpin:'PALLAV018B', village_lgd_code:'627845', patta_no:'PTT-PA007', owner_name:'Rajan Pillai',            area_acres:0.40,  district:'Chengalpattu', taluk:'Pallavaram', village:'Zamin Pallavaram',    land_type:'private',   status:'disputed',   centroid_lat:12.9688, centroid_lng:80.1467 },
  { survey_no:'21/1C',  sub_division:'1C',  ulpin:'PALLAV021C', village_lgd_code:'627845', patta_no:'PTT-PA008', owner_name:'Annamalai Gounder',       area_acres:1.20,  district:'Chengalpattu', taluk:'Pallavaram', village:'Zamin Pallavaram',    land_type:'private',   status:'clear',      centroid_lat:12.9760, centroid_lng:80.1545 },
  { survey_no:'25/3A',  sub_division:'3A',  ulpin:'PALLAV025A', village_lgd_code:'627845', patta_no:'GOV-PA009', owner_name:'Defence Authority India', area_acres:15.50, district:'Chengalpattu', taluk:'Pallavaram', village:'St Thomas Mount',      land_type:'government',status:'government', centroid_lat:12.9820, centroid_lng:80.1612 },
  { survey_no:'30/2A',  sub_division:'2A',  ulpin:'PALLAV030A', village_lgd_code:'627845', patta_no:'PTT-PA010', owner_name:'Vijayalakshmi Naidu',     area_acres:0.60,  district:'Chengalpattu', taluk:'Pallavaram', village:'Zamin Pallavaram',    land_type:'private',   status:'clear',      centroid_lat:12.9678, centroid_lng:80.1489 },
  { survey_no:'34/1B',  sub_division:'1B',  ulpin:'PALLAV034B', village_lgd_code:'627845', patta_no:'PTT-PA011', owner_name:'Murugesan Pillai',        area_acres:0.35,  district:'Chengalpattu', taluk:'Pallavaram', village:'Zamin Pallavaram',    land_type:'private',   status:'encroached', centroid_lat:12.9695, centroid_lng:80.1501 },
  { survey_no:'38/5A',  sub_division:'5A',  ulpin:'PALLAV038A', village_lgd_code:'627845', patta_no:'PTT-PA012', owner_name:'Chandrasekaran Raja',     area_acres:0.90,  district:'Chengalpattu', taluk:'Pallavaram', village:'Chromepet',           land_type:'private',   status:'clear',      centroid_lat:12.9521, centroid_lng:80.1425 },
  { survey_no:'42/2C',  sub_division:'2C',  ulpin:'PALLAV042C', village_lgd_code:'627845', patta_no:'PTT-PA013', owner_name:'Saraswathi Devi',         area_acres:0.25,  district:'Chengalpattu', taluk:'Pallavaram', village:'Chromepet',           land_type:'private',   status:'clear',      centroid_lat:12.9510, centroid_lng:80.1412 },
  { survey_no:'47/1A',  sub_division:'1A',  ulpin:'PALLAV047A', village_lgd_code:'627845', patta_no:'GOV-PA014', owner_name:'Tamil Nadu Government',   area_acres:4.80,  district:'Chengalpattu', taluk:'Pallavaram', village:'Chromepet',           land_type:'government',status:'government', centroid_lat:12.9498, centroid_lng:80.1398 },
  { survey_no:'52/3B',  sub_division:'3B',  ulpin:'PALLAV052B', village_lgd_code:'627845', patta_no:'PTT-PA015', owner_name:'Balasubramaniam',         area_acres:0.70,  district:'Chengalpattu', taluk:'Pallavaram', village:'Pammal',              land_type:'private',   status:'disputed',   centroid_lat:12.9612, centroid_lng:80.1378 },
  { survey_no:'56/4A',  sub_division:'4A',  ulpin:'PALLAV056A', village_lgd_code:'627845', patta_no:'PTT-PA016', owner_name:'Karthikeyan Nair',        area_acres:0.50,  district:'Chengalpattu', taluk:'Pallavaram', village:'Pammal',              land_type:'private',   status:'clear',      centroid_lat:12.9598, centroid_lng:80.1362 },
  { survey_no:'61/2A',  sub_division:'2A',  ulpin:'PALLAV061A', village_lgd_code:'627845', patta_no:'FOR-PA017', owner_name:'Forest Department TN',    area_acres:8.40,  district:'Chengalpattu', taluk:'Pallavaram', village:'Pammal',              land_type:'forest',    status:'clear',      centroid_lat:12.9578, centroid_lng:80.1345 },
  { survey_no:'65/1B',  sub_division:'1B',  ulpin:'PALLAV065B', village_lgd_code:'627845', patta_no:'PTT-PA018', owner_name:'Lakshmi Narayan',         area_acres:0.65,  district:'Chengalpattu', taluk:'Pallavaram', village:'Moovarasampettai',    land_type:'private',   status:'encroached', centroid_lat:12.9648, centroid_lng:80.1432 },
  { survey_no:'70/3C',  sub_division:'3C',  ulpin:'PALLAV070C', village_lgd_code:'627845', patta_no:'PTT-PA019', owner_name:'Periasamy Gopal',         area_acres:1.10,  district:'Chengalpattu', taluk:'Pallavaram', village:'Moovarasampettai',    land_type:'private',   status:'clear',      centroid_lat:12.9638, centroid_lng:80.1418 },
  { survey_no:'74/2B',  sub_division:'2B',  ulpin:'PALLAV074B', village_lgd_code:'627845', patta_no:'POR-PA020', owner_name:'Tamil Nadu Government',   area_acres:6.30,  district:'Chengalpattu', taluk:'Pallavaram', village:'Moovarasampettai',    land_type:'poramboke', status:'government', centroid_lat:12.9625, centroid_lng:80.1405 }
];

async function seed() {
  const batch = db.batch();
  
  for (const parcel of parcels) {
    const ref = db.collection('land_parcels').doc();
    const geojson = generatePolygonFromCentroid(
      parcel.centroid_lat,
      parcel.centroid_lng,
      parcel.area_acres
    );
    
    batch.set(ref, {
      ...parcel,
      geojson_coordinates: JSON.stringify(geojson),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  await batch.commit();
  console.log('20 Pallavaram parcels seeded to Firestore');
  process.exit();
}

seed().catch(err => { 
  console.error(err); 
  process.exit(1); 
});
