import {
  getRandomRotation,
  debounce,
  getId,
  hasCreds,
  getToken,
} from "./utils.mjs";

const newPosties = new Set();
let previousPostId;
const posties = {};

/* for each post need to make its own debouncer since other wise if you move 2 posts it cancels out the setTimeout resulting in only one call being triggered */
const debouncers = {};

let mousePositionX;
let mousePositionY;
let activePostId;
let isMouseDown = false;

function createPostElement(postId, content, left, top) {
  const postElement = document.createElement("div");
  const isAuthor = !!localStorage.getItem("token")
  postElement.setAttribute("contenteditable", isAuthor ? "true" : "false");
  postElement.setAttribute("id", postId);
  postElement.style.transform = `rotate(${getRandomRotation()}deg)`;
  postElement.classList.add("post-container");
  postElement.innerHTML = content;
  postElement.style.left = `${left}px`;
  postElement.style.top = `${top}px`;
  return postElement;
}

function handleMouseDown(event) {
  isMouseDown = true;
  activePostId = event.target.id;
  event.target.style.zIndex = 2;
  if (previousPostId && previousPostId !== activePostId) {
    const previousPost = document.getElementById(previousPostId);
    previousPost.style.zIndex = 1;
  }
  previousPostId = activePostId;
  mousePositionX = event.clientX;
  mousePositionY = event.clientY;
}

function isNewAndEmpty(id, content) {
  return newPosties.has(id) && content === "";
}

function handleDebouncerSetup(id) {
  debouncers[id] = debounce(async (id, content, left, top) => {
    if (!hasCreds()) return;
    if (isNewAndEmpty(id, content)) return;
    posties[id] = { ...posties[id], content, left, top };
    await fetch(`/api/create-posty`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
      },
      body: JSON.stringify({ ...posties[id], id }),
    });
    newPosties.delete(id);
  }, 1000);
}

function shouldIAddToNewPosties(id, postId) {
  if (!id) {
    newPosties.add(postId);
  }
}

function getPosition(event, axis) {
  const position = event?.target?.style?.[axis];
  if (position) {
    return +position.split("px")[0];
  }
  return 0;
}

function createPost(id = undefined, properties = {}) {
  const postId = id || getId();
  shouldIAddToNewPosties(id, postId);
  const { content = "", left = 0, top = 0 } = properties;
  const postElement = createPostElement(postId, content, left, top);
  postElement.addEventListener("mousedown", handleMouseDown);
  handleDebouncerSetup(postId);
  postElement.addEventListener("input", (event) => {
    const postId = event.target.id;
    debouncers?.[postId]?.(
      postId,
      event.target.innerHTML,
      getPosition(event, "left"),
      getPosition(event, "top")
    );
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
function calculateDistance(currentMouseX, currentMouseY, postLeft, postTop) {
  const x = currentMouseX - mousePositionX;
  const y = currentMouseY - mousePositionY;
  mousePositionX = currentMouseX;
  mousePositionY = currentMouseY;
  return { x: postLeft + x, y: postTop + y };
}

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
    post.style.zIndex = 2;
    previousPostId = activePostId;
    debouncers?.[activePostId]?.(activePostId, post.innerHTML, x, y);
  }
}

async function getPostiesIds() {
  const res = await fetch("/api/get-posties");
  const ids = await res.json();
  return ids;
}

function getPostiesPromises(ids) {
  return ids.map((id) =>
    fetch(`/api/get-posty`, {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    })
  );
}

async function getPosties() {
  const ids = await getPostiesIds();
  const promises = getPostiesPromises(ids);
  const res = await Promise.allSettled(promises);
  const arrayedPosties = await Promise.all(
    res.map(async (promise) => await promise.value.json())
  );
  deleteSpinner();
  arrayedPosties.reduce((acc, post) => {
    acc[post.id] = post;
    return acc;
  }, posties);
  drawPosts(posties);
}

function checkCreds() {
  if (!hasCreds()) {
    const addPostButton = document.getElementById("postAdder");
    addPostButton.style.display = "none";
  }
}

function deleteSpinner() {
  const spinner = document.getElementById("spinner");
  spinner.style.display = "none";
}

document.addEventListener("mouseup", () => {
  isMouseDown = false;
});
document
  .getElementById("postAdder")
  .addEventListener("click", () => handleAddPost());
document.addEventListener("mousemove", handlePostMove);
checkCreds();
getPosties();
