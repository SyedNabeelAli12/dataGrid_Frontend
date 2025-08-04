const apiActions = {
carsApi:'/api/cars',
 lovApi:'/api/lovs',
}

const config = {
 baseURL: process.env.REACT_APP_API_URL,
 fetchCars:`${process.env.REACT_APP_API_URL}${apiActions.carsApi}/`,
 fetchCarById:`${process.env.REACT_APP_API_URL}${apiActions.carsApi}/view`,
 fetchCarByFilter:`${process.env.REACT_APP_API_URL}${apiActions.carsApi}/filter`,
 deleteCarById:`${process.env.REACT_APP_API_URL}${apiActions.carsApi}/soft-delete`,
 lovs:`${process.env.REACT_APP_API_URL}${apiActions.lovApi}/`,
}




export default config