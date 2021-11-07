from pymongo import MongoClient
import jwt
import datetime
import hashlib
from flask import Flask, render_template, jsonify, request, redirect, url_for
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta

import requests
from bs4 import BeautifulSoup



# for tr in trs:
#     print(tr.text)
# for te in tes:
#     print(te.text)
# for ti in tis:
#     print(ti['src'])




app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['UPLOAD_FOLDER'] = "./static/profile_pics"

SECRET_KEY = 'SPARTA'

client = MongoClient('localhost', 27017)
db = client.dbspartapasta


# client = MongoClient('mongodb://3.35.47.47', 27017, username="test", password="test")
# db = client.dbsparta



#메인 페이지 생성과 로그인 유지정보
@app.route('/')
def home():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        user_info = db.users.find_one({"username": payload["id"]})
        return render_template('index.html', user_info=user_info)

    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))

# 로그인 페이지/ # 메인페이지와 프로필 페이지는 로그인 상태가 필요하므로 서버로부터 jwt를 발급한다.
@app.route('/login')
def login():
    msg = request.args.get("msg")
    return render_template('login.html', msg=msg)

# 실시간 랭킹페이지 (맨처음 리뷰를 모아오려고 했는데 그래서 API가 저따구임)
@app.route('/reviews')
def reviews():

    return render_template('reviews.html')

# 실시간 랭킹 페이지: 랭킹을 크롤링 하여 DB에 저장하는 기능
# 기능에는 methods가 항상 들어간다고 생각하면 된다. /reviews.html의 postranking()함수와 연결
@app.route('/reviews/reviewsee', methods=['POST'])
def saving():
    # 클라로부터 url과 헤더를 받아서 갖고오는 기능
    url_receive = request.form['url_give']
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
    data = requests.get(url_receive, headers=headers)
    # Beutifulsoup을 이용하여 크롤링 해옴
    soup = BeautifulSoup(data.text, 'html.parser')
    # trs = soup.select('#bestPrdList div > a > div.pname > p')
    # tes = soup.select('#bestPrdList div > a > span')
    # tis = soup.select('#bestPrdList div > a > div.img_plot > img')
    tts = soup.select('#bestPrdList div > a')
    # print(trs)
    for tt in tts:
        name_tag = tt.select_one('div.pname > p')
        rank_tag = tt.select_one('span')
        img_tag = tt.select_one('div.img_plot > img')
        if name_tag is not None:
            name = name_tag.text
            rank = rank_tag.text
            img = img_tag['src']


            doc = {'name': name, 'rank': rank, 'img': img}
            db.ranking.insert_one(doc)
    # 클라로 메시지를 보내기
    return jsonify({'msg':'업데이트 되었습니다!'})

@app.route('/reviews/reviewsee', methods=['GET'])
def listing():
    # DB에서 저장된 모든 랭킹 값을 찾아서 클라로 전달하는기능
    rankings = list(db.ranking.find({}, {'_id': False}))
    return jsonify({'all_rankings':rankings})

# 각 사용자의 프로필과 글을 모아볼 수 있는 공간 methods 가 없으므로
# 메인페이지와 프로필 페이지는 로그인 상태가 필요하므로 서버로부터 jwt를 발급한다.
# 유저 이름을 어떻게 받아오는지 이해가 잘안감
@app.route('/user/<username>')
def user(username):

    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        status = (username == payload["id"])  # 내 프로필이면 True, 다른 사람 프로필 페이지면 False

        user_info = db.users.find_one({"username": username}, {"_id": False})
        return render_template('user.html', user_info=user_info, status=status)
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))

# 명세서를 좀 잘 써야함 로그인페이지에서 로그인이어야하는데 메인페이지에서 로그인인 명세서임
# 여튼 로그인 페이지에서 로그인 기능/ login.html의 sign_in 함수와 연능
@app.route('/sign_in', methods=['POST'])
def sign_in():
    # 로그인
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']
    # 비밀번호를 암호화하는 기능
    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    # DB에서 회원가입 된 아이디와 암호화 된 비밀번호가 지금 클라로부터 받은 아디 비번과 일치하는지 확인
    result = db.users.find_one({'username': username_receive, 'password': pw_hash})

    if result is not None:
        payload = {
            'id': username_receive,
            'exp': datetime.utcnow() + timedelta(seconds=60 * 60 * 24)  # 로그인 24시간 유지
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

        return jsonify({'result': 'success', 'token': token})
    # 찾지 못하면
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})

# 회원가입시 중복확인 기능/ login.html의 Check_dup 함수와 연결
@app.route('/sign_up/check_dup', methods=['POST'])
def check_dup():
    username_receive = request.form['username_give']
    exists = bool(db.users.find_one({"username": username_receive}))
    return jsonify({'result': 'success', 'exists': exists})

# 프로필 페이지에서 프로필 업데이트 정보를 받아와 DB로 저장하는 기술/user.html의 update_profile과 연결
@app.route('/update_profile', methods=['POST'])
def save_img():
    token_receive = request.cookies.get('mytoken')
    try:
        # 클라이언트에서 받은 고유 ID
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        username = payload["id"]
        # 이름과 내용은 db에 따로 저장
        name_receive = request.form["name_give"]
        about_receive = request.form["about_give"]
        new_doc = {
            "profile_name": name_receive,
            "profile_info": about_receive
        }
        # 프로필 이미지는 들어온다면
        if 'file_give' in request.files:
            file = request.files["file_give"]
            # 파일 이름을 보호하는 코드
            filename = secure_filename(file.filename)
            # 파일 이름에서 .으로 쪼갠 것중 가장 마지막 부분을 의미
            extension = filename.split(".")[-1]
            # 파일 내에서 대입하는 방법
            file_path = f"profile_pics/{username}.{extension}"
            # static 안의 파일 경로
            file.save("./static/" + file_path)
            # 새로운 저장소에 파일 이름과 경로 저장
            new_doc["profile_pic"] = filename
            new_doc["profile_pic_real"] = file_path
            # db를 수정해줌
        db.users.update_one({'username': payload['id']}, {'$set': new_doc})
        return jsonify({"result": "success", 'msg': '프로필을 업데이트했습니다.'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))

# 메인페이지의 모달들의 안에서 리뷰를 다는 기능/  my.js의 post(i)함수와 연결
@app.route('/posting', methods=['POST'])
def posting():
    # 유저의 개인정보를 담아줘야 유저가 작성한 것으로 저장해둘 수 있다
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        # 포스팅하기
        user_info = db.users.find_one({"username": payload["id"]})
        name_receive = request.form["name_give"]
        comment_receive = request.form["comment_give"]
        date_receive = request.form["date_give"]
        doc = {
            "username": user_info["username"],
            "profile_name": user_info["profile_name"],
            "profile_pic_real": user_info["profile_pic_real"],
            "name": name_receive,
            "comment": comment_receive,
            "date": date_receive
        }
        print('insert doc : ', doc)

        db.posts.insert_one(doc)
        return jsonify({"result": "success", 'msg': '포스팅 성공'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))

# 게시한 리뷰를 보여주는 기능/ myjs.js 의 get_posts(username) 함수와 연결되어있다
@app.route("/get_posts", methods=['GET'])
def get_posts():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        # 포스팅 목록 받아오기
        username_receive = request.args.get("username_give")
        # 메인페이지라면 유저정보상관 없이 모든 리뷰를 posts에 저장해라
        if username_receive == "":
            posts = list(db.posts.find({}).sort("date", -1).limit(20))
        # 프로필 페이지라면 내가 쓴 글만 20개까지 최신순으로 찾아서 posts에 저장해라
        else:
            posts = list(db.posts.find({"username": username_receive}).sort("date", -1).limit(20))

        for post in posts:
            #고유값인 object post_id를 str으로 바꿔서 저장해라
            post["_id"] = str(post["_id"])
            #type이 heart인 고유 값 게시물 아이디를 찾아서 그 수를 count_heart라는 변수에 저장해라./ 좋아요 수를 확인하는 것
            post["count_heart"] = db.likes.count_documents({"post_id": post["_id"], "type": "heart"})
            #likes DB에서 확인하는 게시물이 type이 heart이고 유저가 나인 게시물이면 true/false를 변수에 저장해라/ 내가 좋아요를 눌렀냐 안눌렀냐임
            post["heart_by_me"] = bool(db.likes.find_one({"post_id": post["_id"], "type": "heart", "username": payload['id']}))
        return jsonify({"result": "success", "msg": "포스팅을 가져왔습니다.", "posts": posts})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))

# 메인페이지에서 모달에 내가 쓴 리뷰를 게시하는 기능/myjs.js 의 get_posts2(username)와 연결
@app.route("/get_posts2", methods=['GET'])
def get_posts2():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        # 유저 이름을 받아올 필요가 없음. 어차피 탭 게시글 별로 모두의 리뷰가 따로 들어가야함
        username_receive = request.args.get("username_give")
        #모든 게시글을 찾아와서 postings에 최신순으로 20개까지 저장
        postings = list(db.postings.find({}).sort("date", -1).limit(20))
        #모든 리뷰를 찾아와서 posts에 최신순으로 20개까지 저장
        posts = list(db.posts.find({}).sort("date", -1).limit(20))

        for posting in postings:
            posting["_id"] = str(posting["_id"])
            # 저장된 게시글의 이름을 가져옴
            name = posting["name"]
            for post in posts:
                post["_id"] = str(post["_id"])

                post["count_heart"] = db.likes.count_documents({"post_id": post["_id"], "type": "heart"})
                post["heart_by_me"] = bool(db.likes.find_one({"post_id": post["_id"], "type": "heart", "username": payload['id']}))
            #리뷰와 게시글 그리고 게시글에 저장된 이름을 클라이언트로 보낸다
        return jsonify({"result": "success", "msg": "포스팅을 가져왔습니다.", "posts": posts, "postings": postings, "name": name})

    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))

# 좋아요를 DB에 저장하는 기능
@app.route('/update_like', methods=['POST'])
def update_like():
    # 누가 좋아요를 눌렀는지알아야함
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        # 좋아요 수 변경
        user_info = db.users.find_one({"username": payload["id"]})
        post_id_receive = request.form["post_id_give"]
        type_receive = request.form["type_give"]
        action_receive = request.form["action_give"]
        doc = {
            "post_id": post_id_receive,
            "username": user_info["username"],
            "type": type_receive
        }
        if action_receive == "like":
            db.likes.insert_one(doc)
        else:
            db.likes.delete_one(doc)
        count = db.likes.count_documents({"post_id": post_id_receive, "type": type_receive})
        return jsonify({"result": "success", 'msg': 'updated', "count": count})

    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))

# 회원가입기능/ login.html과 연결
@app.route('/sign_up/save', methods=['POST'])
def sign_up():
    username_receive = request.form['username_give']
    password_receive = request.form['password_give']
    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    doc = {
        "username": username_receive,  # 아이디
        "password": password_hash,  # 비밀번호
        "profile_name": username_receive,  # 프로필 이름 기본값은 아이디
        "profile_pic": "",  # 프로필 사진 파일 이름
        "profile_pic_real": "profile_pics/profile_placeholder.png",  # 프로필 사진 기본 이미지
        "profile_info": ""  # 프로필 한 마디
    }
    db.users.insert_one(doc)
    return jsonify({'result': 'success'})

# 프로필 페이지에서 즐겨찾기의 좋아요를 구현하는 기능. 따로 구현해야함 내가 좋아요를 누른 것만 이수
@app.route("/get_stars", methods=['GET'])
def get_stars():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=['HS256'])
        # 포스팅 목록 받아오기
        username_receive = request.args.get("username_give")

        posts = list(db.posts.find({}).sort("date", -1).limit(20))

        for post in posts:
            post["_id"] = str(post["_id"])
            post["count_heart"] = db.likes.count_documents({"post_id": post["_id"], "type": "heart"})
            post["heart_by_me"] = bool(db.likes.find_one({"post_id": post["_id"], "type": "heart", "username": payload['id']}))
        return jsonify({"result": "success", "msg": "포스팅을 가져왔습니다.", "posts": posts})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))

# 게시글을 DB에 저장하는 기능/ postArticle()과 연결
@app.route('/review', methods=['POST'])
def write_review():
    name_receive = request.form['title_give']
    file = request.files['file_give']
    desc_receive = request.form['content_give']

    today = datetime.now()
    mytime = today.strftime('%Y-%m-%d-%H-%M-%S')

    filename = f'file-{mytime}'

    extension = file.filename.split('.')[-1]

    save_to = f'static/{filename}.{extension}'
    file.save(save_to)
    doc = {
        'name': name_receive,
        'file': f'{filename}.{extension}',
        'desc': desc_receive
    }
    db.postings.insert_one(doc)
    return jsonify({'msg': '포스팅 되었습니다'})

# 게시글을 클라이언트에서 보여주도록 보내주는 기능
@app.route('/review', methods=['GET'])
def read_reviews():
    # 모든 게시글을 클라이언트로 보냄
    postings = list(db.postings.find({}, {'_id': False}))
    return jsonify({'all_postings': postings})


if __name__ == '__main__':
    app.run('0.0.0.0', port=3000, debug=True)
