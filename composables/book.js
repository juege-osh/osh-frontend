// 查看电子书章节
export function useBookMenusApi(id){
    return useHttpGet("bookMenus",`/book/menus?id=${id}`,{
        lazy:true
    })
}

// 查看电子书章节内容
export function useBookDetailApi(book_id,id){
    return useHttpGet("bookDetail",`/book/detail?book_id=${book_id}&id=${id}`,{
        lazy:true
    })
}





// TODO: 电子书增加接口，用于添加电子书
// export function useBookDetailApi(book_id,id){
//     return useHttpPost("bookContent",`/book/detail?book_id=${book_id}&id=${id}`,{
//         lazy:true
//     })
// }