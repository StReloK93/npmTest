class ImageViewer {
    images = document.querySelectorAll('.mini-images')
    active = null
    opacity = 0.6
    loading = false
    startIndex = 0
    mounted = () => {}
    constructor() {
        this.init()
    }

    async init() {
        this.setUniqueAttrForImages()
        await this.openImage(this.startIndex)
        this.mounted()
    }



    setUniqueAttrForImages() {
        this.images.forEach((image, index) => {
            image.onclick = () => this.openImage(index)
        })
    }

    async openImage(index) {
        if (this.loading || this.active == index) return
        this.loading = true
        
        const zoomed = document.querySelector('.zoomed-image')
        const child = zoomed.firstChild
        this.active = index

        if (child) {
            const oldParentDataId = child.getAttribute('parent-index')
            const oldParent = this.images[oldParentDataId]
            this.backIntoPlace(child, oldParent)
            child.addEventListener("transitionend", () => child.remove())
        }

        await this.setCurrentImage(index)
    }

    async setCurrentImage(index) {

        const image = this.images[index]
        const zoomed = document.querySelector('.zoomed-image')
        const copy = image.cloneNode(true)
        copy.setAttribute('parent-index', index)
        copy.classList.remove('mini-images')
        this.backIntoPlace(copy, image)

        zoomed.appendChild(copy)

        let promise = new Promise((res) => {
            setTimeout(() => { this.setMainImage(copy, res);  }, 200)
        })

        await promise

        this.images.forEach((image, i) => {
            if (index == i) image.classList.add('active')
            else image.classList.remove('active')
        })
    }


    backIntoPlace(imageTag, parent) {
        imageTag.style.transform = `translate(${parent.offsetLeft}px, ${parent.offsetTop}px)`
        imageTag.style.width = `${parent.clientWidth}px`
        imageTag.style.opacity = this.opacity
    }

    setMainImage(imageTag, response) {
        const zoomed = document.querySelector('.zoomed-image')
        const zoomStyles = window.getComputedStyle(zoomed);
        imageTag.style.transform = 'translate(0px, 0px)'
        imageTag.style.width = `${parseInt(zoomed.clientWidth) - parseInt(zoomStyles.paddingRight)}px`
        imageTag.style.opacity = 1
        imageTag.addEventListener("transitionend", () => {
            this.loading = false
            response()
        })
    }


    async next() {
        if (this.active == this.images.length - 1) this.active = -1
        await this.openImage(this.active + 1)
    }

    async prev() {
        if (this.active == 0) this.active = this.images.length
        await this.openImage(this.active - 1)
    }
}

const viewer = new ImageViewer()
