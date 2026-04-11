// export function usefull(){
//     return useHttpGet("usefull",'/api/website/Favorites',{
//         lazy:true
//     })
// }


export function usefull(){
    const {data } = useFetch('http://localhost:8080/api/website/Favorites',{lazy:true})
    return { data }
}
