app.post('/api/extract', upload.single('file'), async (req, res) => {
    // if this is not needed we should remove it
    logInfo('POST /api/extract',req.body);
    logInfo('FILE=',req.file);
    // we can use const {file, body} = req, instead writing req.file, req.body everywhere

    //instead of this if we can write if(!req.body) {
        //return res.status(500).json({requestID: '', message: 'Missing requried input (form data)'});
    // }
    if (req.body) {

        // its better to destructure this properties from request
        // const {file,body: {requestID,project,idUser}} = req
        const file = req.file;
        const requestID = req.body.requestID;
        const project = req.body.project;
        const idUser = req.body.userID;
        const user = await User.findOne(idUser);

        // its cleaner to check
        // if (!requestID || !project || !idUser || !user) 
        // {return res.status(500).json({requestID, message: 'Missing requried input (requestID, project, file)'});}
        // and we can get rid of else statement 
        if (requestID && project && idUser && user) {
            // if this was used only for debugging we should remove this log
            logDebug('User with role '+user.role, user);
            if (user.role === 'ADVISOR' || user.role.indexOf('ADVISOR') > -1)
                return res.json({requestID, step: 999, status: 'DONE', message: 'Nothing to do for ADVISOR role'});

            /* reset status variables */
            await db.updateStatus(requestID, 1, '');

             // if this was used only for debugging we should remove this log
            logDebug('CONFIG:', config.projects);
            if (project === 'inkasso' && config.projects.hasOwnProperty(project) && file) {

                // looks like this hashSum is not used, so its better to remove it
                const hashSum = crypto.createHash('sha256');
                // we can move this 3 lines to function const fileType = getFileType(...)
                const fileHash = idUser;
                const fileName = 'fullmakt';
                const fileType = mime.getExtension(file.mimetype);
                if (fileType !== 'pdf')
                    return res.status(500).json({requestID, message: 'Missing pdf file'});
                await db.updateStatus(requestID, 3, '');

                const folder = `${project}-signed/${idUser}`;
                // remove if only used for debugging
                logDebug('FILE2=', file);
                // if we have functions with this many parameters its better to pass then in object
                // we can avoid missing or switching some properties
                await uploadToGCSExact(folder, fileHash, fileName, fileType, file.mimetype, file.buffer);
                await db.updateStatus(requestID, 4, '');
                const ret = await db.updateUploadedDocs(idUser, requestID, fileName, fileType, file.buffer);
               //remove debug log and ret unless its neccesary to log this information
                logDebug('DB UPLOAD:', ret);

                await db.updateStatus(requestID, 5, '');

                // this variable isnt used anywhere, we should remove it
                let sent = true;
                const debtCollectors = await db.getDebtCollectors(); 
                logDebug('debtCollectors=', debtCollectors);
                if (!debtCollectors)
                    return res.status(500).json({requestID, message: 'Failed to get debt collectors'});

                // we should iomplement this fix 
                if (!!(await db.hasUserRequestKey(idUser))) { //FIX: check age, not only if there's a request or not
                    return res.json({requestID, step: 999, status: 'DONE', message: 'Emails already sent'});
                }

                const sentStatus = {};
                // forEach is better then for loop here
                // also if we really want to make this clean we could move all inside of this loop to function
                for (let i = 0; i < debtCollectors.length ; i++) {
                    await db.updateStatus(requestID, 10+i, '');
                    // we can destructure these properties
                    // const {id: idCollector, name:collectorName, email: collectorEmail} = debtCollectors[i]
                    const idCollector = debtCollectors[i].id;
                    const collectorName = debtCollectors[i].name;
                    const collectorEmail = debtCollectors[i].email;

                    // we should move it to function and return requestKey
                    const hashSum = crypto.createHash('sha256');
                    const hashInput = `${idUser}-${idCollector}-${(new Date()).toISOString()}`;
                    // remove log if unnecessary
                    logDebug('hashInput=', hashInput);
                    hashSum.update(hashInput);
                    const requestKey = hashSum.digest('hex');
                         // remove log if unnecessary
                    logDebug('REQUEST KEY:', requestKey);

                    //this hash is used only after if below so we dont need to create it  before if 
                    //(!!(await db.setUserRequestKey(requestKey, idUser))
                    //&& !!(await db.setUserCollectorRequestKey(requestKey, idUser, idCollector)))
                    const hash = Buffer.from(`${idUser}__${idCollector}`, 'utf8').toString('base64')

                    if (!!(await db.setUserRequestKey(requestKey, idUser))
                        && !!(await db.setUserCollectorRequestKey(requestKey, idUser, idCollector))) {

                        /* prepare email */
                        // we could return config from function createConfig
                        // const sendConfig = createConfiog(...)
                        const sendConfig = {
                            sender: config.projects[project].email.sender,
                            replyTo: config.projects[project].email.replyTo,
                            // missing string closing
                            subject: 'Email subject,
                            templateId: config.projects[project].email.template.collector,
                            params: {
                                downloadUrl: `https://url.go/download?requestKey=${requestKey}&hash=${hash}`,
                                uploadUrl: `https://url.go/upload?requestKey=${requestKey}&hash=${hash}`,
                                confirmUrl: `https://url.go/confirm?requestKey=${requestKey}&hash=${hash}`
                            },
                            tags: ['request'],
                            to: [{ email: collectorEmail , name: collectorName }],
                        };

                        // remove log if not needed
                        logDebug('Send config:', sendConfig);

                        try {
                            await db.setEmailLog({collectorEmail, idCollector, idUser, requestKey})
                        } catch (e) {
                            logDebug('extract() setEmailLog error=', e);
                        }

                        /* send email */
                        const resp = await email.send(sendConfig, config.projects[project].email.apiKey);
                        logDebug('extract() resp=', resp);

                        // update DB with result
                        await db.setUserCollectorRequestKeyRes(requestKey, idUser, idCollector, resp);

                        if (!sentStatus[collectorName])
                            sentStatus[collectorName] = {};
                        sentStatus[collectorName][collectorEmail] = resp;

                        if (!resp) {
                            // I think we should send error response if sending email failed
                            // If sending email failed client doesnt have information about it since we only log it in console
                            logError('extract() Sending email failed: ', resp);
                        }
                    }
                }
                await db.updateStatus(requestID, 100, '');

                // I don't know if these logs are intentional or for debugging
                // if they are for debugging we should remove them
                logDebug('FINAL SENT STATUS:');
                console.dir(sentStatus, {depth: null});

                // comments should be removed
                //if (!allSent)
                //return res.status(500).json({requestID, message: 'Failed sending email'});

                await db.updateStatus(requestID, 500, '');

                /* prepare summary email */
                // we can use here function from prev comment and avoid duplicate code
                // const sendConfig = createConfiog(...)
                const summaryConfig = {
                    // comments should be removed
                    //bcc: [{ email: 'tomas@inkassoregisteret.com', name: 'Tomas' }],
                    sender: config.projects[project].email.sender,
                    replyTo: config.projects[project].email.replyTo,
                    subject: 'Oppsummering Kravsforespørsel',
                    templateId: config.projects[project].email.template.summary,
                    params: {
                        collectors: sentStatus,
                    },
                    tags: ['summary'],
                    //if we have fixx then why isnt it applied?
                    to: [{ email: 'tomas@upscore.no' , name: 'Tomas' }], // FIXXX: config.projects[project].email.sender
                };
                //debug logs should be removed
                logDebug('Summary config:', summaryConfig);

                // comments should be removed
                /* send email */
                //const respSummary = await email.send(sendConfig, config.projects[project].email.apiKey);
                //logDebug('extract() summary resp=', respSummary);

                await db.updateStatus(requestID, 900, '');
            }
            await db.updateStatus(requestID, 999, '');
            return res.json({requestID, step: 999, status: 'DONE', message: 'Done sending emails...'});
        } else
            return res.status(500).json({requestID, message: 'Missing requried input (requestID, project, file)'});
    }
    res.status(500).json({requestID: '', message: 'Missing requried input (form data)'});
});