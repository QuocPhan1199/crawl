const cheerio = require('cheerio');
const download = require('image-downloader');
const request = require('request-promise');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const file_json = require('./data.json')
const { downloadImage, downloadGallery } = require('./images');


const keys = {
  'address': '所在地',
  'nearest_station': '最寄り駅',
  'initial_expenses': '初期費用',
  'monthly_rent': '月額賃料',
  'people_available': '利用可能人数',
  'area': '面積',
  'operating_company': '運営会社',
  'home_page': 'ホームページ',
  'phone_number': '電話番号',
  'fax_number': 'FAX番号',
  'business_hours': '営業時間',
  'office_form': 'オフィス形態',
  'right_to_buy': 'オプション'
};
const plan_key = {
  'name_plan': 'プラン名',
  'office_form': 'オフィス形態',
  'number_people': '人数',
  'area': '面積',
  'initial_expenses': '初期費用',
  'monthly_rent': '月額賃料',
};
// Begin 
var list_office_data = [];
var list_link_office = [];
var i = 0;
const getDetailOffice = async (url = "https://rentaloffice-search.jp/office/2205/", id) => {
  const response = await fetch(url);
  const body = await response.text();
  const $ = cheerio.load(body);
  var dir = __dirname + `/images/${url.replace(/[^0-9]/g, '')}/`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  let data = {
      id:Number(id),
      office_name: $('#office-detail').find("#office-detail-title").find('.detail-office-name').text().trim(),
      office_detail: [],
      description: {
        label: $('#office-detail').find('#office-point-title').find('.detail-point-title').text().trim(),
        value: $('#office-detail').find("#detail-office-point").find('p').text().trim()
      },
      image: $("#office-detail-module").find('.detail-office-image').find('.main-image img').attr("src") != undefined ? await downloadImage(`https://rentaloffice-search.jp/${$("#office-detail-module").find('.detail-office-image').find('.main-image img').attr("src")}`, dir):'',
      gallery: [],
      plan:[]
  };
  let detail = [];
  $('#office-detail').find('#office-detail-module tbody tr').each((index, el) => {
    
    if(Object.keys(keys).find(key => keys[key] === $(el).find('th').text()) == "right_to_buy")
    {
      let list_item = [];
      $(el).find('td').find('.option-icon').find('.option-true').each((index, el)=>{
        list_item.push($(el).text());
      })
        detail.push({
          key: Object.keys(keys).find(key => keys[key] === $(el).find('th').text()),
          label: $(el).find('th').text().trim(),
          value: list_item.join('|')
        });
    }
    if(Object.keys(keys).find(key => keys[key] === $(el).find('th').text()) == "office_form")
    {
      let list_item = [];
      $(el).find('td').find('.type-true').each((index, el)=>{
        list_item.push($(el).text());
      })
        detail.push({
          key: Object.keys(keys).find(key => keys[key] === $(el).find('th').text()),
          label: $(el).find('th').text().trim(),
          value: list_item.join('|')
        });
    }
    if(Object.keys(keys).find(key => keys[key] === $(el).find('th').text()) !== "right_to_buy" && Object.keys(keys).find(key => keys[key] === $(el).find('th').text()) !== "office_form"){
      detail.push({
        key: Object.keys(keys).find(key => keys[key] === $(el).find('th').text()),
        label: $(el).find('th').text().trim(),
        value: $(el).find('td').text()
      });
    }
    
  });
  let gallery_urls = []
  $("#office-detail-module").find('.detail-office-image').find('.image-list li').each((index, el) => {
    gallery_urls.push(`https://rentaloffice-search.jp/${$(el).find('a').attr("href")}`);
  });
  if($('#office-detail').find('#detail-office-plan').attr("id") !== undefined)
  {
    let plan = {
      plan_title:$('#office-detail').find('#detail-office-plan').find('.office-plan-title').text(),
      plan_detail:[]
    };
   
    let plan_detail_item=[];
    $('#office-detail').find('#detail-office-plan').find('table').find('thead tr th').each((index, el)=>{
      let item = [];
      if(Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()) === "name_plan"){
        $('#office-detail').find('#detail-office-plan').find('table tbody tr').each((index, el)=>{
          item.push( $(el).find('td:eq(0)').text());
        })
        plan_detail_item.push({
          key: Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()),
          label: $(el).text(),
          value: item.join('|')
        });

      }
      if(Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()) === "office_form"){
        $('#office-detail').find('#detail-office-plan').find('table tbody tr').each((index, el)=>{
          item.push( $(el).find('td:eq(1)').text());
        })
        plan_detail_item.push({
          key: Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()),
          label: $(el).text(),
          value: item.join('|')
        });

      }
      if(Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()) === "number_people"){
        $('#office-detail').find('#detail-office-plan').find('table tbody tr').each((index, el)=>{
          item.push( $(el).find('td:eq(2)').text());
        })
        plan_detail_item.push({
          key: Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()),
          label: $(el).text(),
          value: item.join('|')
        });

      }
      if(Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()) === "area"){
        $('#office-detail').find('#detail-office-plan').find('table tbody tr').each((index, el)=>{
          item.push( $(el).find('td:eq(3)').text());
        })
        plan_detail_item.push({
          key: Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()),
          label: $(el).text(),
          value: item.join('|')
        });

      }
      if(Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()) === "initial_expenses"){
        $('#office-detail').find('#detail-office-plan').find('table tbody tr').each((index, el)=>{
          item.push( $(el).find('td:eq(4)').text());
        })
        plan_detail_item.push({
          key: Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()),
          label: $(el).text(),
          value: item.join('|')
        });

      }
      if(Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()) === "monthly_rent"){
        $('#office-detail').find('#detail-office-plan').find('table tbody tr').each((index, el)=>{
          item.push( $(el).find('td:eq(5)').text());
        })
        plan_detail_item.push({
          key: Object.keys(plan_key).find(key=>plan_key[key] === $(el).text()),
          label: $(el).text(),
          value: item.join('|')
        });

      }
    })
    plan.plan_detail = plan_detail_item;
    data.plan = plan;
  }
  

  let images = gallery_urls.length ? await downloadGallery(gallery_urls, dir):[];
  data.office_detail = detail;
  data.gallery = images;
  i++;
  console.log(i);
  await writeFileJson(data);
}


const getOfficeList = async (page) => {
  const response = await fetch(`https://rentaloffice-search.jp/search/?p=${page}`);
  const body = await response.text();
  const $ = cheerio.load(body);
  let list_office = [];
  $('.result-office-list').each((index, el) => {
    list_office.push($(el).find('.result-office-nameUnit h2 a').attr("href"));
  });
  // let list_url={
  //   page:page,
  //   list_url:list_office
  // }
  // checkURL()
  for (let index = 0; index < list_office.length; index++) {
      let id =  list_office[index].replace(/[^0-9]/g, '');
      console.log(id);
      console.log(!checkIdCrawl(id));
    if(!checkIdCrawl(id)){
      await getDetailOffice(`https://rentaloffice-search.jp${list_office[index]}`, id);
      updateStateCrawl('ids', id);
   
    }
      // await getDetailOffice(`https://rentaloffice-search.jp${list_office[index]}`);
      // updateStateCrawl('ids', list_office[index]);
   }
}
const crawlOffices = async (page) => {
  try {
    const response = await fetch(`https://rentaloffice-search.jp/search/`);
    const body = await response.text();
    const $ = cheerio.load(body);
    let page_number = $('#office-result').find('.page-navi:last').find('.number-info').find('.office-number').text().replace(',','');
    let total_page = page+Math.ceil(page_number/30);
    for (let index = page+1; index <= total_page; index++) {
      let links = await getOfficeList(index);
      updateStateCrawl('page', index);
    }
    console.log(list_link_office.length);
    for (let index = 0; index < list_link_office.length; index++) {
          await getDetailOffice(`https://rentaloffice-search.jp${list_link_office[index]}`);
    }
  } catch (error) {
    console.log("🚀 ~ file: server.js:169 ~ crawlOffices ~ error", error)
  }
}
const state_loaded = require('./state.json');
crawlOffices(state_loaded.page);
function writeFileJson(data) {    
  return new Promise((resolve, reject) => {
    file_json.push(data)    
    fs.writeFile('data.json', JSON.stringify(file_json), (err) => {
      if (err) reject(err)
      resolve("File saved.")
    })
  });
}
function checkIdCrawl(id) {    
    const state_json = require('./state.json');
    return state_json.ids.includes(id);
}


function updateStateCrawl(type='page',value) {    
  return new Promise((resolve, reject) => {
    const state_json = require('./state.json');
    if(type==='page'){
      state_json.page = value;
    }else if(type==='ids'){
      state_json.ids = [...state_json.ids,value];
      console.log(state_json.ids);
    }
    fs.writeFile('state.json', JSON.stringify(state_json), (err) => {
      if (err) reject(err)
      resolve("File saved.")
    })
  });
}

// const url = require('./url.json');

// function checkURL(data) {    
//   return new Promise((resolve, reject) => {
//     url.push(data)    
//     fs.writeFile('url.json', JSON.stringify(url), (err) => {
//       if (err) reject(err)
//       resolve("File saved.")
//     })
//   });
// }