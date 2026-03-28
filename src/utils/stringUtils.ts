import slugify from 'slugify';
// generate slug from title
export const generateSlug = (title: string) => {
    return slugify(title, {
        lower: true,
        strict: true,
        locale: 'vi',
        remove: /[*+~.()'"!:@]/g
    });
};