exports.showErrorPage = (req,res,next) => {
    res.status(404).render('404',{
        pageTitle: 'Page not found',
        isAuthenticated:req.session.isLoggedIn
    });
    
}