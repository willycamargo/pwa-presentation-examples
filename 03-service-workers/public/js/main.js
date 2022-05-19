import { generateNickname } from "./generate-nickname.js"

// service worker register
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
}

/**
 * API Functions
 */
const createPost = async (post) => {
  await fetch('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(post),
  })
}

const getPosts = async () => {
  const response = await fetch('/posts')
  const posts = await response.json()
  return posts
}

const getPostDetail = async (id) => {
  const response = await fetch(`/posts/${id}`)
  const post = await response.json()
  return post
}

/**
 * Create Elements
 */
const createPostElement = (post) => {
  const $post = document.createElement('section')
  $post.classList.add('posts-section__item')
  $post.dataset.id = post.id
  return $post
}

const createUserElement = (post) => {
  const $user = document.createElement('div')
  $user.classList.add('posts-section__item__user')

  const $userFigure = document.createElement('figure')
  $userFigure.classList.add('posts-section__item__user-figure')
  $user.append($userFigure)

  const $userImg = document.createElement('img')
  $userImg.classList.add('posts-section__item__user-img')
  $userImg.setAttribute('src', `https://robohash.org/${post.username}?bgset=bg2`)
  $userImg.setAttribute('width', 120)
  $userImg.setAttribute('height', 120)
  $userFigure.append($userImg)

  handleImageError($userImg)

  return $user
}

const createContentElement = (post) => {
  const $content = document.createElement('div')
  $content.classList.add('posts-section__item__content')

  const $contentHeader = document.createElement('header')
  $contentHeader.classList.add('posts-section__item__header')
  const createdAt = new Date(post.createdAt)
  const formattedDate = createdAt.toLocaleDateString('en-us', {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
  $contentHeader.innerHTML = `<b>${post.username}</b><time datetime="${formattedDate}">${formattedDate}</time>`
  $content.append($contentHeader)

  const $contentText = document.createElement('p')
  $contentText.classList.add('posts-section__item__text')
  $contentText.innerText = post.title
  $content.append($contentText)

  return $content
}

const createUserInfoElement = (username) => {
  const $userInfo = document.createElement('user-info')
  $userInfo.classList.add('user-info')

  const $userInfoFigure = document.createElement('figure')
  $userInfoFigure.classList.add('user-info__figure')
  $userInfo.append($userInfoFigure)

  const $userInfoImage = document.createElement('img')
  $userInfoImage.classList.add('user-info__img')
  $userInfoImage.setAttribute('src', `https://robohash.org/${username}?bgset=bg2`)
  $userInfoImage.setAttribute('width', 120)
  $userInfoImage.setAttribute('height', 120)
  $userInfoFigure.append($userInfoImage)

  handleImageError($userInfoImage)

  const $userInfoName = document.createElement('h4')
  $userInfoName.classList.add('user-info__name')
  $userInfoName.innerText = username
  $userInfo.append($userInfoName)

  return $userInfo
}

const createPostDetailModal = (post, $target) => {
  const $postDetailModal = document.createElement('div')
  $postDetailModal.classList.add('modal')
  
  const $modalOverlay = document.createElement('div')
  $modalOverlay.classList.add('modal__overlay')
  $postDetailModal.append($modalOverlay)

  const $modalContainer = document.createElement('div')
  $modalContainer.classList.add('modal__container')
  $postDetailModal.append($modalContainer)
  
  const $modalHeader = document.createElement('header')
  $modalHeader.classList.add('modal__header')
  $modalContainer.append($modalHeader)

  const $modalHeaderBackButton = document.createElement('button')
  $modalHeaderBackButton.classList.add('modal__back-button')
  $modalHeaderBackButton.innerHTML = '<span class="material-icons">arrow_back_ios</span>'
  $modalHeader.append($modalHeaderBackButton)

  const $modalHeaderTitle = document.createElement('h3')
  $modalHeaderTitle.classList.add('modal__title')
  $modalHeaderTitle.innerText = post.title
  $modalHeader.append($modalHeaderTitle)

  const $modalHeaderCloseButton = document.createElement('button')
  $modalHeaderCloseButton.classList.add('modal__close-button')
  $modalHeaderCloseButton.innerHTML = '<span class="material-icons">close</span>'
  $modalHeader.append($modalHeaderCloseButton)

  const $modalContent = document.createElement('div')
  $modalContent.classList.add('modal__content')
  $modalContent.innerText = 'Loading...'
  $modalContainer.append($modalContent)

  $target.append($postDetailModal)

  // helpers
  const setContent = (content) => {
    $modalContent.innerHTML = content
  }
  
  const open = () => {
    $postDetailModal.classList.add('modal--open')
    document.body.classList.add('scroll-disabled')
  }

  const close = () => {
    $postDetailModal.classList.remove('modal--open')
    document.body.classList.remove('scroll-disabled')
    setTimeout(() => {
      $target.removeChild($postDetailModal)
    }, 1000)
  }

  // events
  $modalHeaderBackButton.addEventListener('click', close)
  $modalHeaderCloseButton.addEventListener('click', close)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        $element: $postDetailModal,
        setContent,
        open,
        close,
      })
    }, 1)
  })
}

/**
 * Handlers
 */
const handleImageError = ($imgElement) => {
  $imgElement.addEventListener('error', () => {
    if ($imgElement.dataset.error) return
    $imgElement.setAttribute('src', '/img/avatar.png')
    $imgElement.dataset.error = true
  })
}

const showPostDetail = async (post) => {
  const postDetailModal = await createPostDetailModal(post, document.body)
  postDetailModal.open()
  const postDetail = await getPostDetail(post.id)
  postDetailModal.setContent(postDetail.content)
}

const addPostToPage = (post) => {
  // Post Item
  const $post = createPostElement(post)

  // User
  const $user = createUserElement(post)
  $post.append($user)

  // Content
  const $content = createContentElement(post)
  $post.append($content)
  
  // Append to the timeline
  const $postsTodoList = document.getElementById('list-posts')
  $postsTodoList.prepend($post)

  // Attach events
  $post.addEventListener('click', () => showPostDetail(post))
}

const handleFormSubmit = (e) => {
  e.preventDefault()
  const $form = e.target
  const formData = new FormData($form)
  const title = formData.get('title')
  const content = formData.get('content')
  const username = localStorage.getItem('username')

  const post = {
    username: username,
    title: title,
    content: content,
    createdAt: (new Date()).toISOString(),
    id: Date.now()
  }

  createPost(post)
  addPostToPage(post)
  $form.reset()
}

const setupUser = () => {
  const username = localStorage.getItem('username') || generateNickname()
  localStorage.setItem('username', username)
  const $userInfo = createUserInfoElement(username)
  document.getElementById('user-info-container').append($userInfo)
}

const renderPostsTimeline = async () => {
  const posts = await getPosts()
  for (let i = 0; i < posts.length; i++) {
    const currentPost = posts[i]
    addPostToPage(currentPost)
  }
}

// Initialize
setupUser()
renderPostsTimeline()
// setupPostDetailModal()

// DOM Events
document.getElementById('form-posts').addEventListener('submit', handleFormSubmit)
