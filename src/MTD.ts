import * as minimist from 'minimist';
import Track from './Track';

module.exports = class MTD {
    public argv: minimist.ParsedArgs;
    public settings: Settings;
    public tracks: GenericObject;
    public defaults: GenericObject;

    constructor (options?: Option[], args?: string[]) {
        if (!args || args === process.argv) {
            args = process.argv.slice(2);
        }

        const opts: minimist.Options = this.remapOptions(options);
        this.defaults = opts.default;
        delete opts.default;

        this.argv = minimist(args, opts);

        this.settings = {
            multi: false,
            reruns: false,
            results: false
        };

        this.tracks = {};
    }

    public configure (config: Settings): this {
        for (let key in config) {
            if (config.hasOwnProperty(key) && this.settings.hasOwnProperty(key)) {
                this.settings[key] = config[key];
            }
        }

        return this;
    }

    public track (handle: string, options: Option[], block: Block): this {
        if (this.track.hasOwnProperty(handle)) {
            throw new Error(`Duplicate track ${ handle }`);
        }

        this.tracks[handle] = new Track(handle, options, block);

        return this;
    }

    public embark (): void {
        this.argv._.forEach((handle: string): void => {
            if (this.tracks.hasOwnProperty(handle)) {
                const track: Track = this.tracks[handle];

                if (!track.departed || this.settings.reruns) {
                    this.dispatch(track);
                }
            }
        });
    }

    private dispatch (track: Track): void {
        if (!track.cache) {
            track.cache = track.options.map((option: Option): any => {
                return this.argumentFromOption(option, track);
            });
        }

        track.departed = true;
        track.block.apply(this, track.cache);
    }

    private argumentFromOption (option: Option, track: Track): any {
        const optName: string = (
            this.argv.hasOwnProperty(option.$)
                ? option.$
                : (option.alias && this.argv.hasOwnProperty(option.alias))
                    ? option.alias
                    : ''
        );

        if (optName) {
            return this.argv[optName];
        }

        if (option.hasOwnProperty('_')) {
            return option._;
        }

        if (this.defaults.hasOwnProperty(option.$)) {
            return this.defaults[option.$];
        }

        if (option.optional) {
            return;
        }

        throw new Error('Track is missing an option...');
    }

    private remapOptions (options: Option[] = []): minimist.Options {
        const result: minimist.Options = {
            alias: {},
            boolean: [],
            default: {},
            string: []
        };

        options.forEach((option: Option): void => {
            const name: string = option.$;

            if (option.hasOwnProperty('alias')) {
                result.alias[name] = option.alias;
            }

            if (option.hasOwnProperty('_')) {
                result.default[name] = option._;
            }

            if (option.hasOwnProperty('type') &&
                (option.type === 'boolean' || option.type === 'string')) {
                (result as any)[option.type].push(name);
            }
        });

        return result;
    }
};
