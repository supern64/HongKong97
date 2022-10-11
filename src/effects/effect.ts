interface Effect {
    getIsActive(): boolean
    update(delta: number): void
}

export default Effect;