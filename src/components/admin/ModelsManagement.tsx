import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { models as models1 } from '@/data/models';
import { models2 } from '@/data/models2';
import { models3 } from '@/data/models3';
import { models4 } from '@/data/models4';


const allModels = [...models1, ...models2, ...models3, ...models4];

export default function ModelsManagement() {
  const [newModel, setNewModel] = useState({
    name: '',
    age: '',
    location: '',
    ethnicity: '',
    bio: '',
    interests: '',
    imageUrl: '',
    price: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Model management functionality would be implemented here. In production, this would save to a database.');
    setNewModel({
      name: '',
      age: '',
      location: '',
      ethnicity: '',
      bio: '',
      interests: '',
      imageUrl: '',
      price: '',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Models ({allModels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {allModels.map((model) => (
              <div key={model.id} className="border rounded-lg p-3">
                <img src={model.imageUrl} alt={model.name} className="w-full h-32 object-cover rounded mb-2" />
                <h3 className="font-semibold">{model.name}</h3>
                <p className="text-sm text-gray-600">{model.ethnicity}</p>
                <p className="text-sm font-bold">${model.price}/month</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Model</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newModel.name}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={newModel.age}
                  onChange={(e) => setNewModel({ ...newModel, age: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newModel.location}
                  onChange={(e) => setNewModel({ ...newModel, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ethnicity">Ethnicity</Label>
                <Input
                  id="ethnicity"
                  value={newModel.ethnicity}
                  onChange={(e) => setNewModel({ ...newModel, ethnicity: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price ($/month)</Label>
                <Input
                  id="price"
                  type="number"
                  value={newModel.price}
                  onChange={(e) => setNewModel({ ...newModel, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={newModel.imageUrl}
                  onChange={(e) => setNewModel({ ...newModel, imageUrl: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={newModel.bio}
                onChange={(e) => setNewModel({ ...newModel, bio: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input
                id="interests"
                value={newModel.interests}
                onChange={(e) => setNewModel({ ...newModel, interests: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Add Model</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
