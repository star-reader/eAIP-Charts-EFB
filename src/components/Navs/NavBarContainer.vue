<template>
    <div class="app-nav-bar-wrapper">
        <slot></slot>
    </div>
</template>

<style lang='scss' scoped>
.app-nav-bar-wrapper {
    position: fixed;
    width: var(--nav-width-sidebar-md);
    height: calc(100vh - var(--header-height) - var(--safe-area-inset-top) - var(--safe-area-inset-bottom));
    top: calc(var(--header-height) + var(--safe-area-inset-top));
    left: var(--safe-area-inset-left);
    z-index: var(--z-nav);
    background: transparent;
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
}


@media (min-width: 1920px) {
    .app-nav-bar-wrapper {
        width: var(--nav-width-sidebar-xl);
    }
}

@media (min-width: 1440px) and (max-width: 1919px) {
    .app-nav-bar-wrapper {
        width: var(--nav-width-sidebar-lg);
    }
}

@media (min-width: 768px) and (max-width: 1023px) {
    .app-nav-bar-wrapper {
        width: var(--nav-width-sidebar-sm);
    }
}

@media (max-width: 767px) {
    .app-nav-bar-wrapper {
        top: var(--header-height);
        height: calc(100vh - var(--header-height));
        width: var(--nav-width-sidebar-sm);
    }
}

@media (max-width: 480px) {
    .app-nav-bar-wrapper {
        .app-nav-bar {
            padding: 2px var(--spacing-xs);
        }
    }
}
</style>