function formatDate(date) {
  let dayOfMonth = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hour = date.getHours();
  let minutes = date.getMinutes();

  // formatting
  month = month < 10 ? "0" + month : month;
  dayOfMonth = dayOfMonth < 10 ? "0" + dayOfMonth : dayOfMonth;
  hour = hour < 10 ? "0" + hour : hour;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return `${year}-${month}-${dayOfMonth} ${hour}:${minutes}`;
}

function addThreadList(thread){

    if(thread.isDelete !== 1){
        const html = `
        <div class="thread ${thread.isFollow === 1 ? "thread-followed":""}">
            <a href="thread.html?id=${thread.id}">
                <div class="thread-icon">
                    <i class="fa fa-question-circle fa-3x" aria-hidden="true"></i>
                </div>
                <div class="thread-content">
                    <h1 class="thread-content-title">${thread.title}</h1>
                    <ul class="thread-content-info">
                        <li class="thread-content-info-author">Posted by ${thread.author}</li>
                        <li class="thread-content-info-replaycount">${thread.comments.length} ${thread.comments.length > 1 ? "comments" : "comment"}</li>
                        <li class="thread-content-info-date">${formatDate(new Date(thread.date))}</li>
                    </ul>
                </div>
            </a>
            <div class="thread-follow">
                ${thread.author === user.username ? '<button id="edit-btn">Edit</button>' : ''}
                <button id="follow-btn">${thread.isFollow === 1 ? "Followed":"Follow"}</button>
            </div>
        </div>
                `

        return html
    }

    return ''
}

function addComment(comment){
    let commentsArea = document.querySelector("#comments-area");
    const html = `
    <div class="thread-body-comment">
        <ul>
            <li class="author">${comment.author}</li>
            <li class="date">${formatDate(new Date(comment.date))}</li>
        </ul>
        <p>${comment.content}</p>
    </div>

    `
    commentsArea.insertAdjacentHTML('beforeend', html)
}

function setFollowState(target){
    target.parentElement.parentElement.classList.toggle(
        "thread-followed"
      );

      const url = new URL(
        target.parentElement.parentElement.children[0].href
      );
      const searchParams = url.searchParams;
      const id = searchParams.get("id");

      if (target.innerText === "Follow") {
        target.innerText = "Followed";
        threads[id].isFollow = 1;
        localStorage.setItem('threads',JSON.stringify(threads))
      } else {
        target.innerText = "Follow";
        threads[id].isFollow = 0;
        localStorage.setItem('threads',JSON.stringify(threads))
      }
}

function setUsername(){
    let username = document.getElementById('username')
    username.innerText = user.username
}

function NewPost(id, title, author, content){
    let post = {
        id: id,
        title: title,
        author: author,
        date: Date.now(),
        isFollow:1,
        isDelete:0,
        content:content,
        comments: []
      }

    return post
}

function addNewPost(){

    let postWindow = document.querySelector(".new-post-backdrop")
    let title = document.querySelector("#title-text")
    let author = user.username
    let content = document.querySelector("#new-post-content")

    let post = new NewPost(threads.length, title.value, author, content.value)
    threads.push(post)
    localStorage.setItem('threads',JSON.stringify(threads))

    title.value = ''
    content.value = ''
    postWindow.classList.toggle('new-post-display')

    return post

}

(function () {
	window.onpageshow = function(event) {
		if (event.persisted) {
			window.location.reload();
		}
	};
})();

let path = window.location.pathname;
let page = path.split("/").pop();
let editId

if (page === "index.html") {
  setUsername()

  let container = document.querySelector("#thread-list");

  for (let thread of threads) {
    container.insertAdjacentHTML("afterbegin", addThreadList(thread));
  }

  let body = document.querySelector('body')

  
  body.addEventListener("click", (event) => {
    if (event.target.id === "follow-btn") {
        setFollowState(event.target)
    }

    if(event.target.id === "new-post-btn" || event.target.id ==='mobile-post-btn'){
        let postWindow = document.querySelector(".new-post-backdrop")
        postWindow.classList.toggle('new-post-display')
    }

    if(event.target.id === "submit-post-btn"){
        let title = document.querySelector("#title-text").value.trim()
        let content = document.querySelector("#new-post-content").value.trim()

        if(title !== '' && content !== ''){
            container.insertAdjacentHTML("afterbegin", addThreadList(addNewPost()));
        } else {
            window.alert('The title and description cannot be empty.')
        }
             
    }

    // load edit panel
    if(event.target.id === "edit-btn"){
        let postWindow = document.querySelector(".edit-post-backdrop")
        postWindow.classList.toggle('new-post-display')

        let url = event.target.parentElement.previousElementSibling.getAttribute('href')
        editId = url.slice(url.indexOf('=')+1)
        thread = threads[editId]

        let title = document.querySelector("#edit-post-title")
        let textarea = document.querySelector("#edit-post-content")

        title.value = thread.title
        textarea.value = thread.content

    }

    if(event.target.id === "edit-post-btn"){
        let title = document.querySelector("#edit-post-title")
        let textarea = document.querySelector("#edit-post-content")

        thread = threads[editId]
        thread.title = title.value
        thread.content = textarea.value
        localStorage.setItem('threads',JSON.stringify(threads))
        title.value = ''
        textarea.value = ''
        alert('Post updated!')
        location.reload()
    }


    if(event.target.id === "delete-post-btn"){

        thread = threads[editId]
        thread.isDelete = 1
        localStorage.setItem('threads',JSON.stringify(threads))
        alert('Post Deleted!')

        let title = document.querySelector("#edit-post-title")
        let textarea = document.querySelector("#edit-post-content")
        title.value = ''
        textarea.value = ''

        location.reload()
    }

    if(event.target.id === "cancel-post-btn"){
        
        let postWindow = event.target.parentElement.parentElement.parentElement.parentElement
        postWindow.classList.toggle('new-post-display')
    }
  });
}




if (page === "thread.html") {
    setUsername()

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    thread = threads.find((element) => element.id.toString() === id);

    let container = document.querySelector("#thread-list");
    container.insertAdjacentHTML("afterbegin", addThreadList(thread))

    addComment(thread)

    for (const comment of thread.comments) {
        addComment(comment)
    }


    document.querySelector('body').addEventListener('click',(event) => {


        if (event.target.getAttribute('id') === 'submit-comment-btn'){
            const textarea = document.querySelector('#comment-reply')

            if(textarea.value.trim() !== ''){
            let comment = {
                author: user.username,
                date: Date.now(),
                content: textarea.value
            }
            addComment(comment)
            textarea.value = ''

            thread.comments.push(comment)
            localStorage.setItem('threads',JSON.stringify(threads))

            window.location.reload();
        }else{
            window.alert('Enter your comments before submitting.')
        }

        }

        if (event.target.id === "follow-btn") {
            setFollowState(event.target)
        }
        
        if(event.target.id === "new-post-btn" || event.target.id ==='mobile-post-btn'){
            let postWindow = document.querySelector(".new-post-backdrop")
            postWindow.classList.toggle('new-post-display')
        }
    
        if(event.target.id === "submit-post-btn"){
            
            addNewPost()
            window.location.href = `thread.html?id=${threads.length-1}`;
        }
        
        if(event.target.id === "cancel-post-btn"){
            
            let postWindow = document.querySelector(".new-post-backdrop")
            postWindow.classList.toggle('new-post-display')
        }
        

        // load edit panel
        if(event.target.id === "edit-btn"){
            let postWindow = document.querySelector(".edit-post-backdrop")
            postWindow.classList.toggle('new-post-display')
    
            let title = document.querySelector("#edit-post-title")
            let textarea = document.querySelector("#edit-post-content")
    
            title.value = thread.title
            textarea.value = thread.content
        }

        if(event.target.id === "edit-post-btn"){
            let title = document.querySelector("#edit-post-title")
            let textarea = document.querySelector("#edit-post-content")
    
            thread.title = title.value
            thread.content = textarea.value
            localStorage.setItem('threads',JSON.stringify(threads))
            title.value = ''
            textarea.value = ''
            alert('Post updated!')
            location.reload()
        }

        if(event.target.id === "delete-post-btn"){

            thread.isDelete = 1
            localStorage.setItem('threads',JSON.stringify(threads))
            alert('Post Deleted!')
    
            let title = document.querySelector("#edit-post-title")
            let textarea = document.querySelector("#edit-post-content")
            title.value = ''
            textarea.value = ''
    
            location.href = 'index.html'
        }


    })

}
