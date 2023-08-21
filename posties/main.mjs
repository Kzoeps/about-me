import { debounce, getId } from "./utils.mjs";

// dummy data
const posties = {
  123: {
    content:
      "post bay bay wa gi bay mi tshu bae<div><br></div><div>ga chi ben na ngi mi tshay dhi gi gadhay bay bay ru</div><div><i><br></i></div><div><i>trust in me and you shall</i> <b>see</b><br></div><div><b><br></b></div><div><b>and there you go&nbsp;trust in me and you shall see</b>&nbsp;people this is rich text fomratting</div><div><br></div>",
    left: 0,
    top: 0,
  },
};

/* for each post need to make its own debouncer since other wise if you move 2 posts it cancels out the setTimeout resulting in only one call being triggered */
const debouncers = {};

let mousePositionX;
let mousePositionY;
let activePostId;
let isMouseDown = false;

function createPostElement(postId, content, left, top) {
  const postElement = document.createElement("div");
  postElement.setAttribute("contenteditable", "true");
  postElement.setAttribute("id", postId);
  postElement.classList.add("post-container");
  postElement.innerHTML = content;
  postElement.style.left = `${left}px`;
  postElement.style.top = `${top}px`;
  return postElement;
}

function handleMouseDown(event) {
  isMouseDown = true;
  activePostId = event.target.id;
  mousePositionX = event.clientX;
  mousePositionY = event.clientY;
}

function handleDebouncerSetup(id) {
  debouncers[id] = debounce((id, content, left, top) => {
    posties[id] = { ...posties[id], content, left, top };
  }, 3000);
}

function createPost(id = undefined, properties = {}) {
  const postId = id || getId();
  const { content = "", left = 0, top = 0 } = properties;
  const postElement = createPostElement(postId, content, left, top);
  postElement.addEventListener("mousedown", handleMouseDown);
  handleDebouncerSetup(postId);
  postElement.addEventListener("input", (event) => {
    const postId = event.target.id;
    debouncers?.[postId]?.(postId, event.target.innerHTML, left, top);
  });
  posties[postId] = { content, left, top };
  return postElement;
}

function addPost(postElement) {
  const container = document.getElementById("container");
  container.appendChild(postElement);
}

function handleAddPost(id = undefined, properties = undefined) {
  const postElement = createPost(id, properties);
  addPost(postElement);
}

function drawPosts(posts) {
  Object.entries(posts).forEach(([id, props]) => {
    handleAddPost(id, props);
  });
}


/* some stuff in here because if i kept it as simple as x = current then theres jitter as it instantly moves to the mouse
   so i need to calculate where the mouse was on mousedown and how much it moved after that.
   and after calculating the distance we just add it to the elements x and y position so that there is no jitter and it moves smoothly
*/
function calculateDistance(currentMouseX, currentMouseY, postLeft, postTop){
  const x = currentMouseX - mousePositionX;
  const y = currentMouseY - mousePositionY;
  mousePositionX = currentMouseX;
  mousePositionY = currentMouseY;
  return { x: postLeft + x, y: postTop + y };
};

function handlePostMove(event) {
  if (isMouseDown && activePostId) {
    const post = document.getElementById(activePostId);
    const { x, y } = calculateDistance(
      event.clientX,
      event.clientY,
      parseInt(post.style.left),
      parseInt(post.style.top)
    );
    post.style.left = `${x}px`;
    post.style.top = `${y}px`;
    debouncers?.[activePostId]?.(activePostId, post.innerHTML, x, y);
  }
}


document.addEventListener("mouseup", () => {
  isMouseDown = false;
});
document.getElementById("postAdder").addEventListener("click", () => handleAddPost());
document.addEventListener("mousemove", handlePostMove);
drawPosts(posties);