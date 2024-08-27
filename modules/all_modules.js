import qpm from 'query-params-mongo';
import createModel from './createModel.js';

let getObjectId = function(val) {
    return mongoose.Types.ObjectId(val);
};

var processQuery = qpm({
    autoDetect: [
        { fieldPattern: /_id$/, dataType: 'objectId' },
        { fieldPattern: /orderNo$/, dataType: 'string' },
    ],
    converters: {objectId: getObjectId }
});

const all_modules = {
    twoBlogs: async function (req, res) {
        let model = await createModel(`${req.params.brand}-blogs`);
        let blogs = await model.find({ visibility: "blog" }).limit(2);
        return blogs;
    },

    footerBlogs: async function (req, res) {
        let model = await createModel(`${req.params.brand}-blogs`);
        let blogs = await model.find({ visibility: "blog" }).limit(3);
        return blogs;
    },

    threePages: async function (req, res) {
        let model = await createModel(`${req.params.brand}-blogs`);
        return {
            education: await model.findOne({ slug: "education" }).lean(),
            helpAndSupport: await model.findOne({ slug: "help-and-support" }).lean(),
            volunteering: await model.findOne({ slug: "volunteering" }).lean()
        };
    },

    gallery: async function (req, res) {
        let model = await createModel(`${req.params.brand}-gallery`);
        let output = await model.find().lean();
        output = output.map(val => {
            val.number = val.url.split("/image/upload/")[1].split("/dedicatedparents/")[0];
            val.slug = val.url.split("/gallery-photos/")[1];
            return val;
        });
        return output;
    },

    causes: async function (req, res) {
        let model = await createModel(`${req.params.brand}-causes`);
        let output = await model.find().lean();
        output = output.map(val => {
            val.number = val.bannerImg.split("/image/upload/")[1].split("/dedicatedparents/")[0];
            val.imgSlug = val.bannerImg.split("/causes-photos/")[1];
            return val;
        });
        return output;
    },

    pastThreeEvents: async function (req, res) {

        req.query = processQuery(req.query);
        let model = await createModel(`${req.params.brand}-events`);
        let output = await model.aggregate([
            [
                {
                    $addFields: {
                        newDate: {
                            $dateFromString: {
                                dateString: "$date",
                            }
                        }
                    },
                },
                {
                    $match: {
                        newDate: {
                            $lt: new Date()
                        }
                    }
                },
                {
                    $sort: {
                        newDate: -1
                    }
                },
                {
                    $limit: 3
                }
            ]
        ]);
        return output;

    },

    pastEvents: async function (req, res) {
        req.query = processQuery(req.query);
        let model = await createModel(`${req.params.brand}-events`);
        let output = await model.aggregate([
            [
                {
                    $addFields: {
                        newDate: {
                            $dateFromString: {
                                dateString: "$date",
                            }
                        }
                    },
                },
                {
                    $match: {
                        newDate: {
                            $lt: new Date()
                        }
                    }
                },
                {
                    $sort: {
                        newDate: -1
                    }
                }
            ]
        ]);
        return output;

    },

    futureEvents: async function (req, res) {

        req.query = processQuery(req.query);
        let model = await createModel(`${req.params.brand}-events`);
        let output = await model.aggregate([
            [
                {
                    $addFields: {
                        newDate: {
                            $dateFromString: {
                                dateString: "$date",
                            }
                        }
                    },
                },
                {
                    $match: {
                        newDate: {
                            $gt: new Date()
                        }
                    }
                },
                {
                    $sort: {
                        newDate: -1
                    }
                }
            ]
        ]);
        return output;

    },

    staffs: async function (req, res) {
        let model = await createModel(`${req.params.brand}-staffs`);
        let output = await model.find().lean();
        return output;
    },

    blogPosts: async function(req,res) {
        let model = await createModel(`${req.params.brand}-blogs`);
        let output = await model.find({visibility: "blog"}).sort({_id: -1}).lean();
        output = output.map( val => {
            val.number = val.bannerImg.split("/image/upload/")[1].split("/dedicatedparents/")[0];
            val.imgSlug = val.bannerImg.split("/blogs-photos/")[1]
            return val;
        });
        return output;
    },

    pages: async function(req,res) {
        let model = await createModel(`${req.params.brand}-blogs`);
        let output = await model.find({visibility: "page"}).sort({_id: -1}).lean();
        output = output.map( val => {
            val.number = val.bannerImg.split("/image/upload/")[1].split("/dedicatedparents/")[0];
            val.imgSlug = val.bannerImg.split("/pages-photos/")[1]
            return val;
        });
        return output;
    },

    blog: async function(req,res) {
        let model = await createModel(`${req.params.brand}-blogs`);
        let output = await model.findOne({slug: req.params.slug}).lean();
        output.number = output.bannerImg.split("/image/upload/")[1].split("/dedicatedparents/")[0];
        output.imgSlug = output.bannerImg.split("/blogs-photos/")[1];
        return output;
    }
};

export default all_modules;