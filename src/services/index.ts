import axios from 'axios';

export function getROIDataAPI({ country, app }: { country?: string, app?: string }) {
  return axios.request({
    url: '/api/get-roi-data',
    method: 'GET',
    params: {
      country,
      app
    }
  });
}

// 获取所有国家列表
export function getAllCountriesAPI() {
  return axios.request({
    url: '/api/get-all-countries',
    method: 'GET',
  });
}

// 获取所有APP列表  
export function getAllAppsAPI() {
  return axios.request({
    url: '/api/get-all-apps',
    method: 'GET',
  });
}

