// 새로고침이 되지않는 좋아요
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
    // 새로고침을 안함
    // window.location.reload()

}

// 자동으로 업데이트 되는 좋아요
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
    // 새로고침을 함
    window.location.reload()
}

// app.py 에서 @app 의 posting()과 연결/ 메인페이지에서 각각의 모달들에 리뷰를 다는 기능
function post(i) {
    // id가 modal-post${i}에서 그 하위의 id가 input-name인 것을 찾는 것/input-name이 너무 많이 쓰임
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
            // 보내고 새로운 값을 보기 위해선 이렇게 새로고침을 보내면서 해줘야함
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

// 프로필페이지의 리뷰를 보여주는 기능 클라이언트 부분
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
                    // 언제 리뷰를 달았는지
                    let time_post = new Date(post["date"])
                    // 시간이 얼마나 지났는지 알려줌
                    let time_before = time2str(time_post)
                    // 하트를 내가 눌렀다면 하트채우기 : 하트 지우기
                    let class_heart = post['heart_by_me'] ? "fa-heart" : "fa-heart-o"
                    // 리뷰의 좋아요 수
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
<!--                                                        자동으로 업데이트 반영을 위해 toggle_like2 사용-->
                                                        <a class="level-item is-sparta" aria-label="heart" onclick="toggle_like2('${post['_id']}', 'heart')">
                                                            <span class="icon is-small"><i class="fa  ${class_heart}"
                                                                                           aria-hidden="true"></i></span>&nbsp;<span class="like-num">${num2str(count_heart)}</span>
                                                        </a>
                                                    </div>

                                                </nav>
                                            </div>
                                        </article>
                                    </div>`
                    // 프로필 페이지에서 내가 쓴 글 목록에 리뷰를 게시
                    $("#post-box").append(html_temp)

                }
            }
        }
    })
}

// 메인페이지에서 모달에 내가 쓴 리뷰를 게시하는 함수
function get_posts2(username) {
    if (username == undefined) {
        username = ""
    }
    // 게시하려는 모달의 리뷰들을 올릴 때마다 새로고침하여 업데이트 해주는 코드
    $("#momomo").empty()
    $.ajax({
        type: "GET",
        url: `/get_posts2?username_give=${username}`,
        data: {},
        success: function (response) {
            if (response["result"] == "success") {
                let posts = response["posts"]
                let postings = response["postings"]
                console.log(posts)
                console.log(postings)
                console.log(response["name"])
                //새롭게 생기는 게시글, 즉 탭마다 리뷰가 달려야 하기 때문에 이중 for문을 구성
                for (let j = 0; j < postings.length; j++) {
                    const posting = postings[j];
                    // 생기는 게시글마다 리뷰들을 달아줘야 함
                    for (let i = 0; i < posts.length; i++) {
                        let post = posts[i]


                        let time_post = new Date(post["date"])
                        let time_before = time2str(time_post)
                        let class_heart = post['heart_by_me'] ? "fa-heart" : "fa-heart-o"
                        let count_heart = post['count_heart']
                        //게시글과 리뷰의 이름이 같은 조건을 변수에 저장
                        let same_review = post.name === posting.name;
                        //if문 안에서 생성해버리면 나와서 없어지므로 밖에서 변수 선언
                        let html_temp = ""
                        // 새롭게 생성되는 모달마다 숫자를 만들어 새롭게 생성되도록하고 게시글과 리뷰의 이름이 같은 것만 게시되도록 하였다
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
<!--                                                                메인페이지 리뷰에 작성하는 것이라 새로고침이 필요없어서 toggle_like()를 사용하였다-->
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


                            $(`#momomo${j}`).append(html_temp)
                        }

                    }

                }
            }
        }
    })
}

// 프로필 페이지의 즐겨찾기를 구현하는 기능 내가 좋아요를 누른 것이라 따로 구현해야함
function get_stars(username) {

    $("#post-box2").empty()
    $.ajax({
        type: "GET",
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
                    // 내가 좋아요를 한다면
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
<!--                                                        자동으로 새로고침이 되어 업데이트가 반영 되도록 toggle_like2 사용-->
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
                    // 즐겨찾기 부분에 리뷰를 게시해줌
                    $("#post-box2").append(html_temp)
                }
            }
        }
    })
}

// 게시글을 작성하는 함수/ write_review와 연결
function postArticle() {
    // 게시글 작성란과 연결되어있음
    let title = $('#abc').val()
    let content = $('#def').val()
    // id가 file인 줄에서 파일의 개수를 file 변수에 넣어라, .files[0]가 개수를 의미
    let file = $('#file')[0].files[0]
    // FormData()에 넣어서 받는 이유는 사진 파일을 그냥 받아줄 수가 없기 때문에
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

// 게시글과 모달들을 보여주는 함수/ read_review와 연결
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
                //리뷰를 작성해주는 모달을 생성되는 탭 마다 붙여 넣도록 만듬, i를 이용하여 여러개의 모달을 게시물의 개수에 따라 자동으로 생성
                //modal-post 는 리뷰를 작성하는 모달임
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
<!--                                                                모달마다 리뷰들이 자동으로 들어가게 만드는 post(i) 함수 사용-->
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
                // 이 모달을 hiimodal 이라는 변수에 담아 가상의 모달 보관공간인 posthi에 붙여넣었음
                // 이제 버튼으로 onclick을 활용해 posthi 가상공간에서 모달들을 꺼내는 식으로 사용
                $('#posthi').append(hiimodal)
                //같은 방식으로 mymodal은 리뷰를 보여주는 모달임 거기서 리뷰쓰기를 눌러 모달을 볼 수 있음
                //리뷰를 보여주는 모달을 i를 이용하여 게시글의 개 수에 따라 자동으로 생성되도록 함
                let himodal = `<div class="modal" id="mymodal${i}" tabIndex="-1" role="dialog"
                                     aria-labelledby="exampleModalLongTitle"                                    
                                     aria-hidden="true">                                    
                                     <div class="modal-background" onClick='$("#mymodal${i}").removeClass("is-active")'></div>
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                    <div class="modal-header">
                                        <!--                                                각 모달마다 각 게시글에 해당되는 이름을 갖고 오도록 name 변수활용-->
                                            <h5 class="modal-title" id="mymodal${i}">${name} 리뷰</h5>
                                                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">          
                                                      <span aria-hidden="true" onClick='$("#mymodal${i}").removeClass("is-active")'>&times;</span>
                                                             </button>             </div> 
                                                       <div id="momomo${i}">        
                                                    
                                                    <div class="modal-body" id="momo">                  </div>           
                                                    <!--방금전에 생성한 가상공간에 있던 modal-post를 버튼으로 불러옴-->
                                                    </div>                                            
                                                    <div class="modal-footer">
                                                    <button class="button is-black is-sparta"
                                                    onClick='$("#mymodal${i}").removeClass("is-active"); $("#modal-post${i}").addClass("is-active")'
                                                    >리뷰쓰기
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
                // 같은 방식으로 이 모달을 himodal에 담아 가상공간인 hiii에 붙여넣음
                $('#hiii').append(himodal)
                // 마지막으로 탭의 자리인 columns에 붙여 넣기 위해 카드를 형성하여 temp_html 변수에 저장
                let temp_html = `<div class="card" id="cards-box">
                                        <!--                                             클릭시 가상 공간에서 리뷰를 볼 수 있는 공간인 mymodal을 호출함-->
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

