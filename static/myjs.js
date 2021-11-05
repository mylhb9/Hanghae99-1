function toggle_like(post_id, type) {
    console.log(post_id, type)
    let $a_like = $(`#${post_id} a[aria-label='heart']`)
    let $i_like = $a_like.find("i")
    if ($i_like.hasClass("fa-heart")) {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: "unlike"
            },
            success: function (response) {
                console.log("unlike")
                $i_like.addClass("fa-heart-o").removeClass("fa-heart")
                $a_like.find("span.like-num").text(num2str(response["count"]))
            }
        })
    } else {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: "like"
            },
            success: function (response) {
                console.log("like")
                $i_like.addClass("fa-heart").removeClass("fa-heart-o")
                $a_like.find("span.like-num").text(num2str(response["count"]))
            }
        })

    }
    // window.location.reload()

}

function toggle_like2(post_id, type) {
    console.log(post_id, type)
    let $a_like = $(`#${post_id} a[aria-label='heart']`)
    let $i_like = $a_like.find("i")
    if ($i_like.hasClass("fa-heart")) {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: "unlike"
            },
            success: function (response) {
                console.log("unlike")
                $i_like.addClass("fa-heart-o").removeClass("fa-heart")
                $a_like.find("span.like-num").text(num2str(response["count"]))
            }
        })
    } else {
        $.ajax({
            type: "POST",
            url: "/update_like",
            data: {
                post_id_give: post_id,
                type_give: type,
                action_give: "like"
            },
            success: function (response) {
                console.log("like")
                $i_like.addClass("fa-heart").removeClass("fa-heart-o")
                $a_like.find("span.like-num").text(num2str(response["count"]))
            }
        })

    }
    window.location.reload()
}

console.log('된거맞아?')
function post(i) {
    let name = $(`#modal-post${i} .input-name`).val()

    let comment = $(`#modal-post${i} .textarea-post`).val()
    let today = new Date().toISOString()
    $.ajax({
        type: "POST",
        url: "/posting",
        data: {
            name_give: name,
            comment_give: comment,
            date_give: today
        },
        success: function (response) {
            $("#modal-post").removeClass("is-active")
            window.location.reload()
        }
    })
}

function time2str(date) {
    let today = new Date()
    let time = (today - date) / 1000 / 60  // 분

    if (time < 60) {
        return parseInt(time) + "분 전"
    }
    time = time / 60  // 시간
    if (time < 24) {
        return parseInt(time) + "시간 전"
    }
    time = time / 24
    if (time < 7) {
        return parseInt(time) + "일 전"
    }
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

function num2str(count) {
    if (count > 10000) {
        return parseInt(count / 1000) + "k"
    }
    if (count > 500) {
        return parseInt(count / 100) / 10 + "k"
    }
    if (count == 0) {
        return ""
    }
    return count
}

function get_posts(username) {
    if (username == undefined) {
        username = ""
    }
    $("#post-box").empty()
    $.ajax({
        type: "GET",
        // url: "/get_posts",
        url: `/get_posts?username_give=${username}`,
        data: {},
        success: function (response) {
            if (response["result"] == "success") {
                let posts = response["posts"]
                console.log(posts)
                for (let i = 0; i < posts.length; i++) {
                    let post = posts[i]

                    let time_post = new Date(post["date"])
                    let time_before = time2str(time_post)
                    let class_heart = post['heart_by_me'] ? "fa-heart" : "fa-heart-o"
                    let count_heart = post['count_heart']
                    let html_temp = `<div class="box" id="${post["_id"]}">
                                        <article class="media">
                                            <div class="media-left">
                                                <a class="image is-64x64" href="/user/${post['username']}">
                                                    <img class="is-rounded" src="/static/${post['profile_pic_real']}"
                                                         alt="Image">
                                                </a>
                                            </div>
                                            <div class="media-content">
                                                <div class="content">
                                                    <p>
                                                        <strong>${post['profile_name']}</strong> <small>@${post['username']}</small> <small>${time_before}</small>
                                                        <br>
                                                        ${post['comment']}
                                                    </p>
                                                </div>
                                                <nav class="level is-mobile">
                                                    <div class="level-left">
                                                        <a class="level-item is-sparta" aria-label="heart" onclick="toggle_like2('${post['_id']}', 'heart')">
                                                            <span class="icon is-small"><i class="fa  ${class_heart}"
                                                                                           aria-hidden="true"></i></span>&nbsp;<span class="like-num">${num2str(count_heart)}</span>
                                                        </a>
                                                    </div>

                                                </nav>
                                            </div>
                                        </article>
                                    </div>`
                    $("#post-box").append(html_temp)

                }
            }
        }
    })
}

function get_posts2(username) {
    if (username == undefined) {
        username = ""
    }
    $("#momomo").empty()
    $.ajax({
        type: "GET",
        // url: "/get_posts",
        url: `/get_posts2?username_give=${username}`,
        data: {},
        success: function (response) {
            if (response["result"] == "success") {
                let posts = response["posts"]
                let postings = response["postings"]
                console.log(posts)
                console.log(postings)
                console.log(response["name"])
                for (let j=0; j<postings.length;j++) {
                    const posting = postings[j];
                    for (let i = 0; i < posts.length; i++) {
                    let post = posts[i]


                    let time_post = new Date(post["date"])
                    let time_before = time2str(time_post)
                    let class_heart = post['heart_by_me'] ? "fa-heart" : "fa-heart-o"
                    let count_heart = post['count_heart']
                    // let same_review = post['same_review'];
                    let same_review = post.name === posting.name;
                    // console.log({same_review, name: post.name})
                    let html_temp = ""
                    if (same_review) {
                        html_temp = `<div id="momo${j}">
                                        <div class="box" id="${post["_id"]}">
                                                <article class="media">
                                                    <div class="media-left">
                                                        <a class="image is-64x64" href="/user/${post['username']}">
                                                            <img class="is-rounded" src="/static/${post['profile_pic_real']}"
                                                                 alt="Image">
                                                        </a>
                                                    </div>
                                                    <div class="media-content">
                                                        <div class="content">
                                                            <p>
                                                                <strong>${post['profile_name']}</strong> <small>@${post['username']}</small> <small>${time_before}</small>
                                                                <br>
                                                                ${post['comment']}
                                                            </p>
                                                        </div>
                                                        <nav class="level is-mobile">
                                                            <div class="level-left">
                                                                <a class="level-item is-sparta" aria-label="heart" onclick="toggle_like('${post['_id']}', 'heart')">
                                                                    <span class="icon is-small"><i class="fa  ${class_heart}"
                                                                                                   aria-hidden="true"></i></span>&nbsp;<span class="like-num">${num2str(count_heart)}</span>
                                                                </a>
                                                            </div>
        
                                                        </nav>
                                                    </div>
                                                </article>
                                            </div>
                                       </div>`

                    // $(`#momomo${j}`).empty();
                    $(`#momomo${j}`).append(html_temp)
                    }

                }

                }
            }
        }
    })
}

function get_stars(username) {

    $("#post-box2").empty()
    $.ajax({
        type: "GET",
        // url: "/get_posts",
        url: `/get_stars?username_give=${username}`,
        data: {},
        success: function (response) {
            if (response["result"] == "success") {
                let posts = response["posts"]
                console.log(posts)
                for (let i = 0; i < posts.length; i++) {
                    let post = posts[i]

                    let time_post = new Date(post["date"])
                    let time_before = time2str(time_post)
                    let class_heart = post['heart_by_me'] ? "fa-heart" : "fa-heart-o"
                    let count_heart = post['count_heart']
                    let html_temp = ""
                    if (post['heart_by_me'] >= 1) {
                        html_temp = `<div class="box" id="${post["_id"]}">
                                        <article class="media">
                                            <div class="media-left">
                                                <a class="image is-64x64" href="/user/${post['username']}">
                                                    <img class="is-rounded" src="/static/${post['profile_pic_real']}"
                                                         alt="Image">
                                                </a>
                                            </div>
                                            <div class="media-content">
                                                <div class="content">
                                                    <p>
                                                        <strong>${post['profile_name']}</strong> <small>@${post['username']}</small> <small>${time_before}</small>
                                                        <br>
                                                        ${post['comment']}
                                                    </p>
                                                </div>
                                                <nav class="level is-mobile">
                                                    <div class="level-left">
                                                        <a class="level-item is-sparta" aria-label="heart" onclick="toggle_like2('${post['_id']}', 'heart')">
                                                            <span class="icon is-small"><i class="fa  ${class_heart}"
                                                                                           aria-hidden="true"></i></span>&nbsp;<span class="like-num">${num2str(count_heart)}</span>
                                                        </a>
                                                    </div>

                                                </nav>
                                            </div>
                                        </article>
                                    </div>`
                    }
                    $("#post-box2").append(html_temp)
                }
            }
        }
    })
}


function postArticle() {
    let title = $('#abc').val()
    let content = $('#def').val()

    let file = $('#file')[0].files[0]
    let form_data = new FormData()

    form_data.append("file_give", file)
    form_data.append("title_give", title)
    form_data.append("content_give", content)

    $.ajax({
        type: "POST",
        url: "/review",
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            alert(response["msg"])
            window.location.reload()
        }
    });
}

function showArticles() {
    $.ajax({
        type: "GET",
        url: "/review",
        data: {},
        success: function (response) {
            let postings = response['all_postings']
            for (let i = 0; i < postings.length; i++) {
                let name = postings[i]['name']
                let file = postings[i]['file']
                let desc = postings[i]['desc']
//                 let hiimobody = `<div class="modal-body" id="momo${i}">
// <!--                        여기다가 포스팅한 탭 당 리뷰-->
//                                 </div>`
//                 $('#momomo').append(hiimobody)
                let hiimodal = `<div class="modal" id="modal-post${i}">
                                    <div class="modal-background" onclick='$("#modal-post${i}").removeClass("is-active")'></div>
                                    <div class="modal-content">
                                        <div class="box">
                                            <article class="media">
                                                <div class="media-content">
                                                    <div class="field">
                                                        <label class="labelprofile" for="input-name">기종</label>
                        
                                                        <p class="control">
                        
                                                            <input id="input-name" class="input input-name"
                                                                   placeholder="기종을 (입력해주세요)" value="${name}">
                                                        </p>
                                                    </div>
                                                    <div class="field">
                                                        <p class="control">
                                                                    <textarea id="textarea-post" class="textarea textarea-post"
                                                                              placeholder="리뷰를 작성해주세요"></textarea>
                                                        </p>
                                                    </div>
                                                    <nav class="level is-mobile">
                                                        <div class="level-left">
                        
                                                        </div>
                                                        <div class="level-right">
                                                            <div class="level-item">
                                                                
                                                                <a class="button is-black is-sparta" onclick="post(${i})">리뷰하기</a>
                                                            </div>
                                                            <div class="level-item">
                                                                <a class="button is-sparta is-outlined"
                                                                   onclick='$("#modal-post${i}").removeClass("is-active")'>취소</a>
                                                            </div>
                                                        </div>
                                                    </nav>
                                                </div>
                                            </article>
                                        </div>
                                    </div>
                                    <button class="modal-close is-large" aria-label="close"
                                            onclick='$("#modal-post").removeClass("is-active")'></button>
                                </div>`
                $('#posthi').append(hiimodal)
                let himodal = `<div class="modal" id="mymodal${i}" tabIndex="-1" role="dialog"
                                     aria-labelledby="exampleModalLongTitle"
                                     aria-hidden="true">
                                    <div class="modal-background" onClick='$("#mymodal${i}").removeClass("is-active")'></div>
                    
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="mymodal${i}">${name} 리뷰</h5>
                                                    
                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                    <span aria-hidden="true" onClick='$("#mymodal${i}").removeClass("is-active")'>&times;</span>
                    
                                                </button>
                                            </div>
                                            <div id="momomo${i}">
                                                <div class="modal-body" id="momo">
                                            </div>
                                                
                                            </div>
                                            <div class="modal-footer">
                                                <button class="button is-black is-sparta"
                                                        onClick='$("#mymodal${i}").removeClass("is-active"); $("#modal-post${i}").addClass("is-active")'>리뷰쓰기
                                                </button>
                                                <button type="button" class="btn btn-secondary" data-dismiss="modal"
                                                        onClick='$("#mymodal${i}").removeClass("is-active")'>나가기
                                                </button>
                    
                                            </div>
                                        </div>
                                    </div>
                                    <button class="modal-close is-large" aria-label="close"
                                            onClick='$("#modal-edit${i}").removeClass("is-active")'></button>
                                </div>`
                $('#hiii').append(himodal)
                let temp_html = `<div class="card" id="cards-box">
                                        
                                        <img class="card-img-top"
                                             src="../static/${file}"
                                             alt="Card image cap" onclick='$("#mymodal${i}").addClass("is-active")'>
                                        <div class="card-body">
                                
                                            <strong class="card-img-top" onclick='$("#mymodal${i}").addClass("is-active")'> ${name} </strong>
                                            <p class="card-text">${desc}</p>
                                        </div>
                                
                                    </div>`
                $('#columns').append(temp_html)


            }


        }

    })
}








