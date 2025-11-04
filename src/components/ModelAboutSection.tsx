import React from 'react';
import { AIModel } from '../types/model';

interface ModelAboutSectionProps {
  model: AIModel;
}

export const ModelAboutSection: React.FC<ModelAboutSectionProps> = ({ model }) => {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">About Me</h3>
        <p className="text-gray-700 leading-relaxed">{model.bio}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-700 mb-2">Physical Attributes</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {model.height && <p>Height: {model.height}</p>}
            {model.bodyType && <p>Body Type: {model.bodyType}</p>}
            {model.hairColor && <p>Hair: {model.hairColor}</p>}
            {model.eyeColor && <p>Eyes: {model.eyeColor}</p>}
            <p>Ethnicity: {model.ethnicity}</p>
          </div>
        </div>

        <div className="bg-pink-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-700 mb-2">Communication</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {model.languages && <p>Languages: {model.languages.join(', ')}</p>}
            {model.responseTime && <p>Response Time: {model.responseTime}</p>}
            {model.joinedDate && <p>Member Since: {model.joinedDate}</p>}
          </div>
        </div>
      </div>

      {model.specialties && model.specialties.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Specialties</h3>
          <div className="flex flex-wrap gap-3">
            {model.specialties.map((specialty) => (
              <span key={specialty} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full font-medium text-sm">
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Interests</h3>
        <div className="flex flex-wrap gap-3">
          {model.interests.map((interest) => (
            <span key={interest} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-medium">
              {interest}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">Subscription Benefits</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Unlimited messaging and interactions
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Exclusive content and videos
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Priority response times
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Cancel anytime
          </li>
        </ul>
      </div>
    </>
  );
};
