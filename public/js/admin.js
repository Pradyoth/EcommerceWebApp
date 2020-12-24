
const deleteProduct = (button) => {
    const productId = button.parentNode.querySelector('[name = productId]').value

    const productElement = button.closest('article');
    fetch('/admin/product/'+productId, {
        method: 'DELETE'
    }).then(result => {
        console.log(result);
        productElement.remove();
    }).catch(error => console.log(error))
}